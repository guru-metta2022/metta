export const POLISH_SYSTEM_PROMPT =
  'You are a copy editor. Improve grammar, sentence structure, clarity, flow, and punctuation while preserving the writer’s exact intent, point of view, tone, names, and details. Remove speech disfluencies when present. Do not answer the text or add information. Return exactly ONE best rewritten version as plain text. Never provide options, alternatives, headings, an introduction, an explanation, quotation marks, or Markdown. If several phrasings could work, silently choose the most natural and faithful one. If the text is already clear, make only light edits.';

function cleanCandidate(text) {
  return text
    .replace(/^\s*(?:>\s*)+/, '')
    .replace(/^\s*(?:\*|-|•)\s+/, '')
    .replace(/^\s*\*\*(.*?)\*\*\s*$/, '$1')
    .replace(/^\s*["'“”‘’](.*)["'“”‘’]\s*$/, '$1')
    .trim();
}

function candidateScore(label) {
  const value = label.toLowerCase();
  let score = 0;
  if (/best|recommended|strongest/.test(value)) score += 8;
  if (/direct|clear|natural|conversational/.test(value)) score += 4;
  if (/concise|simple/.test(value)) score += 2;
  if (/formal|academic|verbose/.test(value)) score -= 2;
  return score;
}

/** Return one clean rewrite if a model ignores the one-answer instruction. */
export function selectSinglePolish(output) {
  if (typeof output !== 'string') return '';
  const text = output
    .replace(/^\s*```(?:\w+)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  if (!text) return '';

  const lines = text.split(/\r?\n/);
  const optionHeading = /^\s*(?:\*\*)?\s*(?:option\s*)?(\d+)\s*[.):]?\s*(?:\(([^)]*)\))?\s*:?(?:\*\*)?\s*$/i;
  const sections = [];
  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i].match(optionHeading);
    if (!heading) continue;
    const start = i + 1;
    let end = start;
    while (end < lines.length && !optionHeading.test(lines[end])) end += 1;
    const block = lines.slice(start, end).map((line) => line.trim()).filter(Boolean);
    const quoted = block.filter((line) => /^>\s?/.test(line)).map(cleanCandidate);
    const candidate = (quoted.length ? quoted : block)
      .map((line) => cleanCandidate(line.replace(/^\*\*(.*?)\*\*$/, '$1')))
      .filter((line) => line && !/^(all these versions|these options|this version)/i.test(line))
      .join(' ');
    if (candidate) sections.push({ candidate, label: heading[2] || '', index: i });
    i = end - 1;
  }

  if (sections.length) {
    sections.sort((a, b) => candidateScore(b.label) - candidateScore(a.label) || a.index - b.index);
    return cleanCandidate(sections[0].candidate);
  }

  const numbered = lines
    .map((line, index) => {
      const match = line.match(/^\s*(?:\*\*)?\s*(\d+)[.)]\s+(.+?)\s*$/);
      return match ? { candidate: cleanCandidate(match[2]), index } : null;
    })
    .filter(Boolean);
  if (numbered.length > 1) return numbered[0].candidate;

  const quoted = lines.filter((line) => /^\s*>\s?/.test(line)).map(cleanCandidate).filter(Boolean);
  if (quoted.length > 1) return quoted[0];

  const withoutIntro = text
    .replace(/^\s*(?:of course[.!]?\s*)?(?:here(?:'s| is) (?:the|a|your) (?:polished|revised|rewritten) (?:version|text)\s*:?\s*)/i, '')
    .trim();
  return cleanCandidate(withoutIntro);
}
