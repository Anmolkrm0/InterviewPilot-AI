/**
 * Automatically formats and capitalizes spoken technical terms,
 * acronyms, and frameworks accurately from raw speech transcripts.
 */
export function formatTechnicalSpeech(rawText: string): string {
  if (!rawText) return "";

  let text = rawText;

  const replacements: [RegExp, string][] = [
    // Frameworks & Tools
    [/\bpage object model\b/gi, "Page Object Model (POM)"],
    [/\bpage objects?\b/gi, "Page Object"],
    [/\bpom\b/gi, "POM"],
    [/\bci\s*\/\s*cd\b|\bci\s+cd\b|\bcicd\b/gi, "CI/CD"],
    [/\bselenium\b/gi, "Selenium"],
    [/\bplaywright\b/gi, "Playwright"],
    [/\bcypress\b/gi, "Cypress"],
    [/\bdata\s*[- ]?testid\b|\bdata\s*[- ]?test\s*id\b/gi, "data-testid"],
    [/\bshadow\s+dom\b/gi, "shadow DOM"],
    [/\bdom\b/gi, "DOM"],
    [/\bx\s*paths?\b|\bxpath\b/gi, "XPath"],
    [/\bui\b/gi, "UI"],
    [/\bux\b/gi, "UX"],
    [/\bsla\b|\bslas\b/gi, "SLA"],
    [/\bprs?\b|\bpull requests?\b/gi, "PR"],
    [/\bapis?\b/gi, "API"],
    [/\brest\s*api\b|\brestful\b/gi, "REST API"],
    [/\bgithub actions\b/gi, "GitHub Actions"],
    [/\bgitlab\s*ci\b/gi, "GitLab CI"],
    [/\bdocker\b/gi, "Docker"],
    [/\bkubernetes\b|\bk8s\b/gi, "Kubernetes"],
    [/\bdatadog\b/gi, "Datadog"],
    [/\bgrafana\b/gi, "Grafana"],
    [/\bstar\s*(format|framework|template)?\b/gi, "STAR framework"],
    [/\bqa\b/gi, "QA"],
    [/\bsdet\b/gi, "SDET"],
    [/\bjson\b/gi, "JSON"],
    [/\bhttp\b/gi, "HTTP"],
    [/\bhttps\b/gi, "HTTPS"],
    [/\bcdp\b/gi, "CDP"],
    [/\bdevtools\b/gi, "DevTools"],
    [/\bwebsocket\b|\bweb\s*sockets?\b/gi, "WebSocket"],
    [/\bjavascript\b/gi, "JavaScript"],
    [/\btypescript\b/gi, "TypeScript"],
    [/\bpython\b/gi, "Python"],
    [/\bmicro[- ]?services\b/gi, "microservices"],
  ];

  for (const [regex, replacement] of replacements) {
    text = text.replace(regex, replacement);
  }

  // Capitalize sentence start
  text = text.replace(/(^\s*|\.\s+)([a-z])/g, (_, sep, letter) => `${sep}${letter.toUpperCase()}`);

  return text;
}
