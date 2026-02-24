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

function sliderLabel(val: number | null): string {
  if (!val) return 'No preference (3)'
  const labels: Record<number, string> = {
    1: 'Strongly lean left/liberal',
    2: 'Lean left/liberal',
    3: 'Moderate / No strong preference',
    4: 'Lean right/conservative',
    5: 'Strongly lean right/conservative',
  }
  return `${labels[val]} (${val}/5)`
}

function formatValues(values: ValuesRow): string {
  const lines = [
    `Religion: ${values.religion || 'Not specified'} (Importance: ${values.religion_importance ?? 'N/A'}/5)`,
    `Environmental Protection: ${sliderLabel(values.environment)}`,
    `Social Safety Net: ${sliderLabel(values.safety_net)}`,
    `Gun Rights: ${sliderLabel(values.guns)}`,
    `Immigration Policy: ${sliderLabel(values.immigration)}`,
    `Healthcare System: ${sliderLabel(values.healthcare)}`,
    `Abortion Access: ${sliderLabel(values.abortion)}`,
    `Education (Public vs Private): ${sliderLabel(values.education)}`,
    `Criminal Justice: ${sliderLabel(values.criminal_justice)}`,
    `LGBTQ+ Rights: ${sliderLabel(values.lgbtq_rights)}`,
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

  return `You are a nonpartisan civic information assistant. Your task is to provide a personalized, factual ballot recommendation based on a voter's stated socioeconomic background and values.

IMPORTANT RULES:
- Be strictly nonpartisan and factual
- Base recommendations entirely on the voter's stated values and circumstances
- Do not inject your own political opinions
- Acknowledge tradeoffs honestly
- Output ONLY valid JSON — no markdown, no extra text

VOTER PROFILE:
=== Socioeconomic Background ===
${formatDemographics(demographics)}

=== Political Values (1=progressive, 5=conservative) ===
${formatValues(values)}

BALLOT CONTEST:
${contestSection}

Analyze this contest and produce a recommendation that aligns with this voter's stated values. Return exactly this JSON structure:
{
  "recommendation": "string — one clear recommendation (e.g., 'Vote YES', 'Vote for Candidate Name', 'Vote NO')",
  "reasoning": "string — 3-4 paragraphs explaining why this aligns with the voter's values, including honest tradeoffs",
  "references": [
    {
      "title": "string — source title",
      "url": "string — real URL if known, otherwise descriptive placeholder",
      "summary": "string — one sentence about what this source shows"
    }
  ],
  "key_factors": ["string array — 3-5 bullet points of the most important factors driving this recommendation"]
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
    references: { title: string; url: string; summary: string }[]
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
    references: parsed.references ?? null,
    key_factors: parsed.key_factors ?? null,
  }
}
