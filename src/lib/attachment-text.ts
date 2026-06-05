export const ATTACHMENT_CHAR_LIMIT = 12000;

const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.json', '.csv', '.ts', '.tsx', '.js', '.jsx', '.py', '.java',
  '.go', '.rs', '.html', '.css', '.xml', '.yaml', '.yml', '.log',
]);

const TEXT_MIME_TYPES = new Set([
  'application/json',
  'application/xml',
  'text/markdown',
  'application/javascript',
  'text/javascript',
  'text/css',
  'text/html',
  'text/csv',
  'text/yaml',
  'text/x-yaml',
]);

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return '';
  return name.slice(dot).toLowerCase();
}

export function isDocxFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}

export function isTextAttachment(file: File): boolean {
  const ext = getFileExtension(file.name);
  if (TEXT_EXTENSIONS.has(ext)) return true;
  const mime = file.type.toLowerCase();
  if (mime.startsWith('text/')) return true;
  if (TEXT_MIME_TYPES.has(mime)) return true;
  if (mime.includes('json') || mime.includes('xml') || mime.includes('markdown')) return true;
  return false;
}

export function truncateAttachmentText(text: string): string {
  if (text.length <= ATTACHMENT_CHAR_LIMIT) return text;
  return `${text.slice(0, ATTACHMENT_CHAR_LIMIT)}\n\n[Truncated]`;
}

export async function readAttachmentText(file: File): Promise<string> {
  if (isDocxFile(file)) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/file-text', { method: 'POST', body: fd });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? 'Failed to read file.');
    }
    const data = (await res.json()) as { text?: string };
    return truncateAttachmentText(data.text ?? '');
  }
  if (isTextAttachment(file)) {
    return truncateAttachmentText(await file.text());
  }
  throw new Error('Unsupported file type. Use .docx or a text-based file.');
}

export function buildMessageWithAttachment(
  input: string,
  attachment: { name: string; text: string } | null,
): string {
  const fileBlock = attachment
    ? `\n\n[Attached file: ${attachment.name}]\n${attachment.text}`
    : '';
  return input.trim() + fileBlock;
}
