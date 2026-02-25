import { Contest, Recommendation } from '@/lib/types/election.types'
import { Database } from '@/lib/types/database.types'
import { getAnthropicClient } from './client'

type DemographicRow = Database['public']['Tables']['survey_demographic']['Row']
type ValuesRow = Database['public']['Tables']['survey_values']['Row']

function formatDemographics(demo: DemographicRow): string {
  const lines = [
    `Income Range: ${demo.income_range || 'Not specified'}`,
    `Employment: ${demo.employment_status?.replace(/_/g, ' ') || 'Not specified'}`,
    `Education: ${demo.education_level?.replace(/_/g, ' ') || 'Not specified'}`,
    `Household Size: ${demo.household_size ?? 'Not specified'}`,
    `Children: ${demo.children_count ?? 'Not specified'}`,
    `Home Ownership: ${demo.home_ownership || 'Not specified'}`,
    `Marital Status: ${demo.marital_status?.replace(/_/g, ' ') || 'Not specified'}`,
    `Health Insurance: ${demo.health_insurance?.replace(/_/g, ' ') || 'Not specified'}`,
    `Military Service: ${demo.military_service ? 'Yes' : 'No'}`,
    `Union Member: ${demo.union_member ? 'Yes' : 'No'}`,
  ]
  return lines.join('\n')
}

// Maps a 1–5 slider value to a plain-language description using the slider's own labels.
// Avoids political framing — describes the actual policy position the voter expressed.
function sliderPosition(val: number | null, leftLabel: string, rightLabel: string): string {
  if (!val || val === 3) return 'No strong preference'
  if (val === 1) return `Strongly prefers: ${leftLabel}`
  if (val === 2) return `Leans toward: ${leftLabel}`
  if (val === 4) return `Leans toward: ${rightLabel}`
  return `Strongly prefers: ${rightLabel}`
}

function formatValues(values: ValuesRow): string {
  const importanceLabel = (v: number | null) =>
    v == null ? 'not specified' : v <= 2 ? 'low' : v === 3 ? 'moderate' : 'high'

  const lines = [
    `Religion: ${values.religion || 'Not specified'} — importance in voting decisions: ${importanceLabel(values.religion_importance)}`,
    `Environmental policy: ${sliderPosition(values.environment, 'prioritize economic growth over regulations', 'prioritize environmental protection')}`,
    `Social safety net: ${sliderPosition(values.safety_net, 'reduce government assistance programs', 'expand social safety net programs')}`,
    `Gun policy: ${sliderPosition(values.guns, 'more gun regulations', 'protect gun ownership rights')}`,
    `Immigration: ${sliderPosition(values.immigration, 'stricter immigration enforcement', 'more welcoming immigration policy')}`,
    `Healthcare: ${sliderPosition(values.healthcare, 'market-based healthcare system', 'universal/government-provided healthcare')}`,
    `Abortion access: ${sliderPosition(values.abortion, 'more restrictions on abortion', 'fewer restrictions on abortion access')}`,
    `Education: ${sliderPosition(values.education, 'school choice and private school support', 'increased public school funding')}`,
    `Criminal justice: ${sliderPosition(values.criminal_justice, 'tough-on-crime enforcement approaches', 'reform and rehabilitation focus')}`,
    `LGBTQ+ rights: ${sliderPosition(values.lgbtq_rights, 'traditional values on LGBTQ issues', 'full legal equality for LGBTQ individuals')}`,
  ]
  return lines.join('\n')
}

function buildPrompt(
  contest: Contest,
  demographics: DemographicRow,
  values: ValuesRow
): string {
  const contestSection =
    contest.contest_type === 'referendum'
      ? `BALLOT MEASURE:
Question: ${contest.referendum_question}
If YES: ${contest.referendum_yes_meaning}
If NO: ${contest.referendum_no_meaning}`
      : `CANDIDATE RACE:
Office: ${contest.office}${contest.district ? ` (${contest.district})` : ''}
Candidates:
${(contest.candidates || []).map((c) => `  - ${c.name} (${c.party || 'No party'})`).join('\n')}`

  return `You are a nonpartisan civic information assistant. Your task is to provide a personalized ballot recommendation based on a voter's real-world circumstances and stated policy preferences.

IMPORTANT RULES:
- Be strictly nonpartisan — do not frame recommendations in terms of political party, left/right, or liberal/conservative labels
- Focus on practical alignment: how would each option actually affect someone in this voter's specific situation?
- Consider their socioeconomic circumstances (income, employment, health coverage, family size, housing) when evaluating which option serves their real interests
- Cross-reference their stated policy preferences with the concrete impacts of each option
- Acknowledge tradeoffs honestly
- Output ONLY valid JSON — no markdown, no extra text

VOTER PROFILE:
=== Socioeconomic Background ===
${formatDemographics(demographics)}

=== Policy Preferences ===
${formatValues(values)}

BALLOT CONTEST:
${contestSection}

Analyze this contest and recommend the option that best aligns with this voter's stated preferences AND their real-world circumstances and interests. Return exactly this JSON structure:
{
  "recommendation": "string — one clear recommendation (e.g., 'Vote YES', 'Vote for Candidate Name', 'Vote NO')",
  "reasoning": "string — 3-4 paragraphs grounded in this voter's specific situation and preferences, including honest tradeoffs",
  "sources": [
    {
      "title": "string — source title",
      "url": "string — real URL if known, otherwise descriptive placeholder",
      "summary": "string — one sentence about what this source shows"
    }
  ],
  "key_factors": ["string array — 3-5 bullet points of the most important factors for THIS voter specifically"]
}`
}

export async function generateRecommendation(
  contest: Contest,
  demographics: DemographicRow,
  values: ValuesRow
): Promise<Omit<Recommendation, 'id' | 'user_id' | 'contest_id' | 'created_at'>> {
  const client = getAnthropicClient()
  const prompt = buildPrompt(contest, demographics, values)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Strip any accidental markdown fences
  const raw = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  let parsed: {
    recommendation: string
    reasoning: string
    sources: { title: string; url: string; summary: string }[]
    key_factors: string[]
  }

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${raw.slice(0, 200)}`)
  }

  return {
    recommendation: parsed.recommendation,
    reasoning: parsed.reasoning,
    sources: parsed.sources ?? null,
    key_factors: parsed.key_factors ?? null,
  }
}
