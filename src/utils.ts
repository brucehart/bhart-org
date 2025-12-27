export const SESSION_COOKIE_NAME = 'bhart_session';

export const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const splitTags = (input: string): string[] => {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const formatDate = (iso: string | null): string => {
  if (!iso) {
    return 'Draft';
  }
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTimeLocal = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const estimateReadingTime = (markdown: string): number => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const getFormValue = (data: FormData, key: string): string => {
  const value = data.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

export const toBoolean = (value: string): boolean => {
  return value === 'on' || value === 'true' || value === '1';
};

export const sanitizeFilename = (filename: string) => {
  const lastSegment = filename.split('/').pop() ?? 'image';
  const match = lastSegment.match(/^(.*?)(\\.[a-zA-Z0-9]+)?$/);
  const base = slugify(match?.[1] ?? lastSegment) || 'image';
  const ext = match?.[2]?.toLowerCase() ?? '';
  return { base, ext };
};

export const humanizeFilename = (key: string) => {
  const lastSegment = key.split('/').pop() ?? key;
  const name = lastSegment.replace(/\\.[^/.]+$/, '');
  const clean = name.replace(/[-_]+/g, ' ').trim();
  return clean || 'Image';
};

export const deriveTagsFromFilename = (filename: string) => {
  const name = humanizeFilename(filename).toLowerCase();
  const raw = name.split(/\s+/).filter(Boolean);
  const unique = new Set<string>();
  for (const word of raw) {
    if (word.length < 2) {
      continue;
    }
    unique.add(word);
  }
  return Array.from(unique);
};

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = size >= 10 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

export const getImageDimensions = (buffer: ArrayBuffer, contentType: string) => {
  const view = new DataView(buffer);
  if (contentType.includes('png') && view.byteLength >= 24) {
    const signature = view.getUint32(0, false) === 0x89504e47;
    if (!signature) {
      return { width: null, height: null };
    }
    const width = view.getUint32(16, false);
    const height = view.getUint32(20, false);
    return { width, height };
  }

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    if (view.byteLength <= 4) {
      return { width: null, height: null };
    }
    let offset = 2;
    while (offset < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = view.getUint8(offset + 1);
      if (marker === 0xc0 || marker === 0xc2) {
        const height = view.getUint16(offset + 5, false);
        const width = view.getUint16(offset + 7, false);
        return { width, height };
      }
      const length = view.getUint16(offset + 2, false);
      if (length < 2) {
        break;
      }
      offset += 2 + length;
    }
  }

  return { width: null, height: null };
};
