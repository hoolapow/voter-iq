import {
  Representative,
  RepresentativeVote,
  RepresentativeBill,
  AlignmentScore,
  OutOfCharacterFlag,
} from '@/lib/types/representative.types'
import { Database } from '@/lib/types/database.types'
import { getAnthropicClient } from '@/lib/claude/client'
import { formatDemographics, formatValues } from '@/lib/claude/prompts'

type DemographicRow = Database['public']['Tables']['survey_demographic']['Row']
type ValuesRow = Database['public']['Tables']['survey_values']['Row']

function buildAlignmentPrompt(
  rep: Representative,
  votes: RepresentativeVote[],
  bills: RepresentativeBill[],
  demographics: DemographicRow,
  values: ValuesRow
): string {
  const voteLines = votes
    .slice(0, 30)
    .map((v) => `  [${v.vote_date}] ${v.vote_choice.toUpperCase()} — ${v.bill_number}: ${v.bill_title} (policy area: ${v.policy_area ?? 'other'})`)
    .join('\n')

  const billLines = bills
    .slice(0, 12)
    .map((b) => `  [${b.sponsorship_type.toUpperCase()}] ${b.bill_number}: ${b.bill_title} | Status: ${b.status ?? 'Unknown'} | Policy: ${b.policy_area ?? 'other'}`)
    .join('\n')

  return `You are a nonpartisan civic analysis assistant helping a voter understand how well their elected representative's actions align with the voter's stated circumstances and preferences.

ABSOLUTE RULES — violating any of these invalidates your response:
1. FORBIDDEN WORDS in your output: "progressive", "conservative", "liberal", "left", "right", "left-wing", "right-wing", "Democrat", "Republican" (when used to describe the voter or their views).
2. Never use political identity framing to describe the voter. Instead, always reference their SPECIFIC STATED PREFERENCES by name (e.g., "your preference for government-provided healthcare", "your preference for stricter immigration enforcement").
3. Do NOT use partisan labels to characterize the legislator's record. Describe what they actually voted for or against.
4. Output ONLY valid JSON — no markdown, no extra text.

VOTER PROFILE:
=== Socioeconomic Background ===
${formatDemographics(demographics)}

=== Stated Policy Preferences ===
${formatValues(values)}

LEGISLATOR:
Name: ${rep.name}
Party: ${rep.party ?? 'Unknown'}
Office: ${rep.office}${rep.district ? ` — ${rep.district}` : ''}
State: ${rep.state}

VOTING RECORD (most recent first):
${voteLines || '  No voting record available'}

SPONSORED / CO-SPONSORED BILLS:
${billLines || '  No bill sponsorships available'}

INSTRUCTIONS:
1. ALIGNMENT SCORE (0–100): Compare the direction of the legislator's votes and bill sponsorships against the voter's stated policy preferences. 100 = perfect alignment on all stated preferences. 0 = complete disagreement.

2. KEY ALIGNMENTS: Identify 2–4 specific votes or bills where the legislator's actions match the voter's stated preferences. Be concrete — cite the bill title and preference.

3. KEY DIVERGENCES: Identify 2–4 specific votes or bills where the legislator's actions contradict the voter's stated preferences. Be concrete.

4. OUT-OF-CHARACTER DETECTION: For each policy area where the legislator has 3 or more votes, determine the dominant direction. Flag any vote that goes against that dominant direction. Also flag sponsored bills that contradict the legislator's own voting record in the same policy area. Only flag genuinely anomalous patterns — not mere nuance.
   Severity guide:
   - "mild": 1 divergent vote among 4–6 in the same policy area
   - "notable": votes against their own dominant direction in 3+ of 4+ votes in an area, or a primary-sponsored bill that contradicts consistent voting
   - "strong": explicit contradiction of a documented public position or party platform position

5. SUMMARY: Write 2–3 plain-English sentences summarizing overall alignment. Reference the voter's specific named preferences, not political identity.

Return exactly this JSON:
{
  "score": number (0–100),
  "summary": "string — 2–3 sentences of plain-English alignment summary. No political labels. Reference the voter's specific named preferences.",
  "key_alignments": ["string — specific agreement with bill/vote citation and the voter's relevant preference"],
  "key_divergences": ["string — specific disagreement with bill/vote citation and the voter's relevant preference"],
  "out_of_character": [
    {
      "type": "vote" | "bill",
      "item_id": "string — use the bill number (e.g. HR 1234)",
      "description": "string — plain-English explanation of why this is anomalous: what the dominant pattern is and how this item diverges from it",
      "severity": "mild" | "notable" | "strong"
    }
  ]
}`
}

export async function generateAlignmentScore(
  rep: Representative,
  votes: RepresentativeVote[],
  bills: RepresentativeBill[],
  demographics: DemographicRow,
  values: ValuesRow
): Promise<Omit<AlignmentScore, 'id' | 'user_id' | 'representative_id' | 'created_at'>> {
  const client = getAnthropicClient()
  const prompt = buildAlignmentPrompt(rep, votes, bills, demographics, values)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    temperature: 0.2,
    system:
      'You are a nonpartisan civic analysis assistant. You NEVER use political identity labels (progressive, conservative, liberal, left, right, Democrat, Republican) to describe a voter or their views. You analyze legislators\' actual voting records and bill sponsorships objectively, comparing them to a voter\'s specific named preferences.',
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  const raw = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  let parsed: {
    score: number
    summary: string
    key_alignments: string[]
    key_divergences: string[]
    out_of_character: OutOfCharacterFlag[]
  }

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Failed to parse Claude alignment response as JSON: ${raw.slice(0, 200)}`)
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(parsed.score))),
    summary: parsed.summary,
    key_alignments: parsed.key_alignments ?? [],
    key_divergences: parsed.key_divergences ?? [],
    out_of_character: parsed.out_of_character ?? [],
  }
}
