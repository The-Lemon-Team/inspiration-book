const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseScheduleTime(value: string): { hour: number; minute: number } {
  const match = value.trim().match(TIME_RE);
  if (!match) {
    throw new Error('INVALID_TIME');
  }
  return {
    hour: Number.parseInt(match[1], 10),
    minute: Number.parseInt(match[2], 10),
  };
}

export function formatScheduleTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function getZonedParts(timeZone: string, instant = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number.parseInt(parts.year, 10),
    month: Number.parseInt(parts.month, 10),
    day: Number.parseInt(parts.day, 10),
    hour: Number.parseInt(parts.hour, 10),
    minute: Number.parseInt(parts.minute, 10),
  };
}

export function getLocalDateKey(timeZone: string, instant = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant);
}

export function isSameLocalDay(
  instant: Date,
  timeZone: string,
  reference = new Date(),
): boolean {
  return getLocalDateKey(timeZone, instant) === getLocalDateKey(timeZone, reference);
}

export function matchesScheduleSlot(
  scheduleTime: string,
  timeZone: string,
  instant = new Date(),
): boolean {
  const { hour, minute } = parseScheduleTime(scheduleTime);
  const parts = getZonedParts(timeZone, instant);
  return parts.hour === hour && parts.minute === minute;
}
