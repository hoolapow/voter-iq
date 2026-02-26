import { Contest, Recommendation } from '@/lib/types/election.types'
import { Database } from '@/lib/types/database.types'
import { getAnthropicClient } from './client'
import { getStateDemographicContext } from '@/lib/data/state-demographics'

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

  return `You are a civic information assistant helping a voter understand how ballot choices align with their personal circumstances and policy preferences.

ABSOLUTE RULES — violating any of these invalidates your response:
1. FORBIDDEN WORDS in your output: "progressive", "conservative", "liberal", "left", "right", "left-wing", "right-wing", "Democrat", "Republican" (when used to describe the voter or their views). Do not use these words to characterize the voter under any circumstances.
2. NEVER say things like "as a progressive", "your conservative stance", "you lean liberal", "your left-leaning values", or any similar political identity framing. These are strictly forbidden.
3. Instead, always reference the voter's SPECIFIC STATED PREFERENCES by name. Say "your preference for government-provided healthcare" not "your progressive healthcare views". Say "your preference for stricter immigration enforcement" not "your conservative immigration stance".
4. Reason from PRACTICAL IMPACT: explain how each option would concretely affect someone with this voter's income level, employment situation, health coverage, family size, housing status, and other real circumstances.
5. Output ONLY valid JSON — no markdown, no extra text.

VOTER PROFILE:
=== Socioeconomic Background ===
${formatDemographics(demographics)}

=== Stated Policy Preferences ===
${formatValues(values)}

BALLOT CONTEST:
${contestSection}

Recommend the option that best matches this voter's stated preferences and serves their real-world interests. In your reasoning, cite their specific preferences and circumstances — never their political identity. Return exactly this JSON:
{
  "recommendation": "string — one clear recommendation (e.g., 'Vote YES', 'Vote for Candidate Name', 'Vote NO')",
  "reasoning": "string — 3-4 paragraphs. Reference specific preferences (e.g., 'your preference for expanded safety net programs') and concrete life circumstances (income, coverage, family size). No political labels. Where relevant, reference specific findings from the sources you cite below.",
  "sources": [
    {
      "title": "string — exact title of the paper, report, or dataset",
      "url": "string — ONLY include a URL if you are confident it is real and stable: prefer DOI links (https://doi.org/...), CBO/CRS permalinks, Pew Research report pages, or official government data portals (bls.gov, census.gov, etc.). Use an empty string rather than guessing or fabricating a URL.",
      "citation": "string — full academic-style citation: Author(s) Last, First Initial. (Year). Title. Journal/Institution, Volume(Issue), Pages or URL. E.g.: 'Autor, D., Levy, F., & Murnane, R. J. (2003). The Skill Content of Recent Technological Change. Quarterly Journal of Economics, 118(4), 1279–1333.'",
      "summary": "string — 1-2 sentences: what this research specifically found AND how that finding directly supports the recommendation made above"
    }
  ],
  "key_factors": ["string array — 3-5 bullets tied to this voter's specific situation, no political labels"]
}

SOURCES REQUIREMENTS:
- Include 3–5 sources minimum.
- Prioritize: peer-reviewed journal articles, NBER/NBER working papers, Congressional Budget Office or Congressional Research Service analyses, Pew Research Center reports, Brookings Institution / Urban Institute / Tax Policy Center studies, and official government statistical sources (BLS, Census Bureau, BEA, NIH, CDC).
- Each source must directly support a specific factual claim made in your reasoning — not be a generic background reference.
- Do NOT cite news articles, opinion pieces, campaign materials, or advocacy websites.
- Do NOT invent or guess URLs. A missing URL is far better than a hallucinated one. Use a real DOI or well-known institution permalink if you know it, otherwise leave url as "".
- The citation field must be formatted properly so the reader can independently locate the source.`
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
    system:
      'You provide personalized ballot guidance. You NEVER use political identity labels (progressive, conservative, liberal, left, right, Democrat, Republican) to describe a voter or their views. You always cite the voter\'s specific named preferences and real-world circumstances instead.',
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
    sources: { title: string; url: string; citation: string; summary: string }[]
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

// ─── Map-panel recommendation (no user account required) ─────────────────────
// Uses the state's median demographic profile from Census data rather than
// a specific user's survey responses. Focuses on objective policy analysis.

function buildMapPrompt(contest: Contest, stateName: string, stateFips: string): string {
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

  const demographicContext = getStateDemographicContext(stateFips)

  return `You are a nonpartisan civic research assistant providing objective, evidence-based ballot analysis for the general public.

ABSOLUTE RULES — violating any of these invalidates your response:
1. This is NOT a personalized recommendation. Do NOT use "you" or address the reader directly.
2. FORBIDDEN WORDS: "progressive", "conservative", "liberal", "left", "right", "left-wing", "right-wing", "Democrat", "Republican" (as ideological labels). Never characterize a candidate or policy using these terms.
3. Focus exclusively on verifiable, factual information: policy outcomes, fiscal analyses, voting records, academic research.
4. Output ONLY valid JSON — no markdown, no extra text.

STATE CONTEXT — ${stateName}:
The following are approximate median demographic statistics for ${stateName} residents, based on U.S. Census Bureau ACS data:
${demographicContext}

BALLOT CONTEST:
${contestSection}

Analyze this contest objectively. Your reasoning should cover:
1. What each option (candidate position / yes / no) would concretely do — policy details, fiscal cost, implementation mechanism.
2. How the likely outcomes would affect residents with the demographic profile above — e.g., median-income homeowners, workers without employer insurance, small-business owners.
3. What peer-reviewed research or official government analyses say about the expected effects of similar policies.
4. Key trade-offs a well-informed voter should weigh.

Do NOT editorialize or express a political preference. Recommend the option that is best supported by objective evidence and aligns with the interests of the typical ${stateName} resident described above. Return exactly this JSON:
{
  "recommendation": "string — one clear evidence-based recommendation (e.g., 'Vote YES', 'Vote for Candidate Name', 'Vote NO')",
  "reasoning": "string — 3–4 paragraphs of factual, nonpartisan analysis. Cite specific policy details and research findings. No political labels. No 'you' language — write in third person (e.g., 'For a median-income renter in ${stateName}...').",
  "sources": [
    {
      "title": "string — exact title of the paper, report, or dataset",
      "url": "string — ONLY a real, stable URL (DOI, CBO/CRS permalink, Pew report page, bls.gov, census.gov, etc.). Use empty string if uncertain.",
      "citation": "string — full academic-style citation: Author(s). (Year). Title. Journal/Institution, Volume(Issue), Pages.",
      "summary": "string — 1–2 sentences: what this research found AND how it directly supports the analysis above"
    }
  ],
  "key_factors": ["string array — 3–5 factual bullet points a voter should know, grounded in the research cited. No political labels."]
}

SOURCES REQUIREMENTS:
- Include 3–5 sources minimum.
- Prioritize peer-reviewed journals, NBER working papers, CBO/CRS analyses, Pew Research Center, Brookings Institution, Urban Institute, Tax Policy Center, and official government statistics (BLS, Census Bureau, BEA, NIH, CDC).
- Each source must directly support a specific claim in the reasoning.
- Do NOT cite news articles, opinion pieces, campaign materials, or advocacy sites.
- Do NOT fabricate URLs. A real citation without a URL is far better than a hallucinated link.`
}

export async function generateMapRecommendation(
  contest: Contest,
  stateName: string,
  stateFips: string,
): Promise<Omit<Recommendation, 'id' | 'user_id' | 'contest_id' | 'created_at'>> {
  const client = getAnthropicClient()
  const prompt = buildMapPrompt(contest, stateName, stateFips)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    temperature: 0.2,
    system:
      'You are a nonpartisan civic research assistant. You NEVER use political identity labels. You reason from verifiable facts, policy details, and peer-reviewed research. You write in third person — never addressing the reader as "you".',
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  const raw = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  let parsed: {
    recommendation: string
    reasoning: string
    sources: { title: string; url: string; citation: string; summary: string }[]
    key_factors: string[]
  }

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Failed to parse Claude map response as JSON: ${raw.slice(0, 200)}`)
  }

  return {
    recommendation: parsed.recommendation,
    reasoning: parsed.reasoning,
    sources: parsed.sources ?? null,
    key_factors: parsed.key_factors ?? null,
  }
}
