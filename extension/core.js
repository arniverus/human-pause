/* Shared, deterministic prototype heuristics. No requests or model calls. */
(function (root) {
  const categories = [
    { id: 'health', label: 'Health & wellbeing', patterns: [/\b(medic(?:al|ine|ation)|diagnos\w*|treat(?:ment|ing)?|symptoms?|vaccin\w*|disease|supplements?|dosage|antibiotics?|cancer|diabetes|public health)\b/i] },
    { id: 'finance', label: 'Financial decisions', patterns: [/\b(invest\w*|stocks?|cryptocurrency|financial|retirement|portfolio|guaranteed returns?|mortgage|loans?)\b/i] },
    { id: 'science', label: 'Scientific claims', patterns: [/\b(stud(?:y|ies)|scientific|research(?:ers)?|clinical|experiment|statistic\w*|peer.reviewed|causal|climate)\b/i] }
  ];
  function classify(text) {
    const matches = categories.filter(c => c.patterns.some(p => p.test(text || '')));
    return { triggered: matches.length > 0, categories: matches.map(({id, label}) => ({id, label})), primary: matches[0]?.id || 'everyday' };
  }
  function reflection(text) {
    const words = (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []);
    const unique = new Set(words).size;
    const specific = /\b(source|evidence|study|studies|research|verify|check|compare|sample|bias|risk|trial|author|date|data|expert|claim|citation|uncertainty|guideline|population|method|context)\b/i.test(text);
    return { valid: words.length >= 12 && unique >= 8 && specific, words: words.length, unique, specific };
  }
  root.HumanPause = { classify, reflection };
  if (typeof module !== 'undefined') module.exports = root.HumanPause;
})(globalThis);
