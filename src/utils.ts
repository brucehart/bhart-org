export const SESSION_COOKIE_NAME = 'bhart_session';
const EASTERN_TIME_ZONE = 'America/New_York';

const getTimeZoneParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number.parseInt(parts.year, 10),
    Number.parseInt(parts.month, 10) - 1,
    Number.parseInt(parts.day, 10),
    Number.parseInt(parts.hour, 10),
    Number.parseInt(parts.minute, 10),
    Number.parseInt(parts.second, 10),
  );
  return asUtc - date.getTime();
};

export const createEasternDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
) => {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetMs = getTimeZoneOffsetMs(utcDate, EASTERN_TIME_ZONE);
  return new Date(utcDate.getTime() - offsetMs);
};

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
    timeZone: EASTERN_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (iso: string | null): string => {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return formatted.replace(',', '');
};

export const formatDateTimeLocal = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  const parts = getTimeZoneParts(date, EASTERN_TIME_ZONE);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const parseEasternDateTimeInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const hour = Number.parseInt(match[4], 10);
  const minute = Number.parseInt(match[5], 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }
  return createEasternDate(year, month, day, hour, minute);
};

export const getEasternYear = () => getTimeZoneParts(new Date(), EASTERN_TIME_ZONE).year;

export const formatRssDate = (iso?: string | null) => {
  const date = iso ? new Date(iso) : new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).formatToParts(date);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }
  return `${values.weekday}, ${values.day} ${values.month} ${values.year} ${values.hour}:${values.minute}:${values.second} ${values.timeZoneName}`;
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

export const extensionForContentType = (contentType: string) => {
  const type = contentType.split(';')[0]?.trim().toLowerCase();
  switch (type) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/jpg':
      return '.jpg';
    case 'image/pjpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/avif':
      return '.avif';
    case 'image/svg+xml':
      return '.svg';
    case 'image/bmp':
      return '.bmp';
    case 'image/tiff':
      return '.tif';
    case 'image/heic':
      return '.heic';
    case 'image/heif':
      return '.heif';
    default:
      return '';
  }
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
