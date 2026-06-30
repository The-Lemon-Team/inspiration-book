export function parseActiveTagNames(text: string): Set<string> {
  const names = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^([^:]+):\s*$/);
    if (match) {
      names.add(match[1].trim().toLowerCase());
    }
  }
  return names;
}

export function insertTagBlock(
  text: string,
  tagName: string,
  cursorStart: number,
  cursorEnd: number,
) {
  const header = `${tagName}:\n - `;
  const before = text.slice(0, cursorStart);
  const after = text.slice(cursorEnd);

  let prefix = '';
  if (before.length > 0) {
    if (before.endsWith('\n\n')) {
      prefix = '';
    } else if (before.endsWith('\n')) {
      prefix = '\n';
    } else {
      prefix = '\n\n';
    }
  }

  const insertion = `${prefix}${header}`;
  const newText = before + insertion + after;
  const newCursor = before.length + insertion.length;

  return { text: newText, cursor: newCursor };
}
