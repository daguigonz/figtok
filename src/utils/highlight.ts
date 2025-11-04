const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

const highlightCSS = (code: string): string => {
  let html = escapeHtml(code)

  html = html.replace(/\{/g, '<span class="brace">{</span>')
  html = html.replace(/\}/g, '<span class="brace">}</span>')

  html = html.replace(/\(/g, '<span class="parenthesis">(</span>')
  html = html.replace(/\)/g, '<span class="parenthesis">)</span>')

  html = html.replace(/:/g, '<span class="colon">:</span>')

  html = html.replace(/;/g, '<span class="comma">;</span>')

  html = html.replace(/(--[\w-]+)/g, '<span class="variable">$1</span>')

  html = html.replace(
    /^\s*([\w-]+)\s*<span class="colon">:<\/span>/gm,
    '<span class="property">$1</span><span class="colon">:</span>'
  )

  html = html.replace(/(#[0-9a-f]{3,6})/gi, '<span class="value">$1</span>')

  html = html.replace(
    /<span class="colon">:<\/span>\s*(\d+(?:px|em|rem|%|vh|vw|s|ms)?)/g,
    '<span class="colon">:</span> <span class="value">$1</span>'
  )

  return html
}

const highlightJSON = (code: string): string => {
  let html = escapeHtml(code)

  // Match key-value pairs first to avoid conflicts with punctuation
  // Unquoted key and string value
  html = html.replace(
    /([\w-]+)\s*:\s*&quot;(.*?)&quot;/g,
    '<span class="key">$1</span><span class="colon">:</span> <span class="quote-double">"</span><span class="string">$2</span><span class="quote-double">"</span>'
  )

  // Unquoted key and number value
  html = html.replace(
    /([\w-]+)\s*:\s*(\d+(?:\.\d+)?)/g,
    '<span class="key">$1</span><span class="colon">:</span> <span class="number">$2</span>'
  )

  // Unquoted key and boolean/null value
  html = html.replace(
    /([\w-]+)\s*:\s*\b(true|false|null)\b/g,
    '<span class="key">$1</span><span class="colon">:</span> <span class="keyword">$2</span>'
  )

  // Highlight remaining punctuation
  html = html.replace(/\{/g, '<span class="brace">{</span>')
  html = html.replace(/\}/g, '<span class="brace">}</span>')
  html = html.replace(/\[/g, '<span class="bracket-square">[</span>')
  html = html.replace(/\]/g, '<span class="bracket-square">]</span>')
  html = html.replace(/,/g, '<span class="comma">,</span>')

  return html
}

export { highlightCSS, highlightJSON }
