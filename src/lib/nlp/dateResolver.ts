import { addDays, addHours, parseISO, isValid, format } from 'date-fns';

export interface ResolvedDate {
  canonicalIso: string;
  formatted: string;
  isImminent: boolean;
  isUncertain: boolean;
  rawMatched: string;
}

/**
 * Resolves relative and absolute temporal expressions relative to a message's timestamp.
 */
export function resolveDeadline(rawText: string, messageTimestampIso: string, imminentHoursThreshold = 36): ResolvedDate | null {
  const text = rawText.toLowerCase();
  let baseDate: Date;
  try {
    baseDate = parseISO(messageTimestampIso);
    if (!isValid(baseDate)) {
      baseDate = new Date();
    }
  } catch {
    baseDate = new Date();
  }

  // 1. Check for unambiguous time keywords
  // "by today at 5pm", "today 18:00", "by 5pm today", "tonight at 8pm"
  const todayTimeMatch = text.match(/(?:by\s+)?(?:today|tonight)\s+(?:at\s+|by\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) ||
                         text.match(/(?:by\s+)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+(?:today|tonight)/i);
  if (todayTimeMatch) {
    const hours = parseHours(todayTimeMatch[1], todayTimeMatch[3]);
    const minutes = todayTimeMatch[2] ? parseInt(todayTimeMatch[2], 10) : 0;
    const target = new Date(baseDate);
    target.setHours(hours, minutes, 0, 0);

    const diffHours = (target.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    return {
      canonicalIso: target.toISOString(),
      formatted: format(target, 'MMM d, yyyy h:mm a'),
      isImminent: diffHours >= -2 && diffHours <= imminentHoursThreshold,
      isUncertain: false,
      rawMatched: todayTimeMatch[0],
    };
  }

  // "by tomorrow [at 5pm]"
  const tomorrowMatch = text.match(/(?:by\s+)?tomorrow(?:\s+(?:at\s+|by\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i);
  if (tomorrowMatch) {
    const target = addDays(baseDate, 1);
    if (tomorrowMatch[1]) {
      const hours = parseHours(tomorrowMatch[1], tomorrowMatch[3]);
      const minutes = tomorrowMatch[2] ? parseInt(tomorrowMatch[2], 10) : 0;
      target.setHours(hours, minutes, 0, 0);
    } else {
      // Default to EOD (18:00)
      target.setHours(18, 0, 0, 0);
    }

    const diffHours = (target.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    return {
      canonicalIso: target.toISOString(),
      formatted: format(target, 'MMM d, yyyy h:mm a'),
      isImminent: diffHours <= imminentHoursThreshold,
      isUncertain: !tomorrowMatch[1], // Slightly uncertain if exact time not specified
      rawMatched: tomorrowMatch[0],
    };
  }

  // "by EOD" or "end of day"
  const eodMatch = text.match(/\b(?:by\s+)?(?:eod|end\s+of\s+day)\b/i);
  if (eodMatch) {
    const target = new Date(baseDate);
    target.setHours(18, 0, 0, 0);
    const diffHours = (target.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    return {
      canonicalIso: target.toISOString(),
      formatted: format(target, 'MMM d, yyyy h:mm a'),
      isImminent: diffHours >= -1 && diffHours <= imminentHoursThreshold,
      isUncertain: false,
      rawMatched: eodMatch[0],
    };
  }

  // "in X hours" / "in X mins"
  const inHoursMatch = text.match(/\bin\s+(\d+)\s*(?:hours|hrs|hr)\b/i);
  if (inHoursMatch) {
    const hrs = parseInt(inHoursMatch[1], 10);
    const target = addHours(baseDate, hrs);
    return {
      canonicalIso: target.toISOString(),
      formatted: format(target, 'MMM d, yyyy h:mm a'),
      isImminent: hrs <= imminentHoursThreshold,
      isUncertain: false,
      rawMatched: inHoursMatch[0],
    };
  }

  // "by Friday [at 5pm]", "by Monday"
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayMatch = text.match(/\b(?:by|before|until|this|next)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)(?:\s+(?:at\s+|by\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i);
  if (dayMatch) {
    const targetDayIndex = dayNames.indexOf(dayMatch[1].toLowerCase());
    if (targetDayIndex !== -1) {
      const currentDayIndex = baseDate.getDay();
      let daysAhead = targetDayIndex - currentDayIndex;
      if (daysAhead <= 0) daysAhead += 7; // Next occurrence
      const target = addDays(baseDate, daysAhead);
      if (dayMatch[2]) {
        const hours = parseHours(dayMatch[2], dayMatch[4]);
        const minutes = dayMatch[3] ? parseInt(dayMatch[3], 10) : 0;
        target.setHours(hours, minutes, 0, 0);
      } else {
        target.setHours(18, 0, 0, 0);
      }
      const diffHours = (target.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
      return {
        canonicalIso: target.toISOString(),
        formatted: format(target, 'MMM d, yyyy h:mm a'),
        isImminent: diffHours <= imminentHoursThreshold,
        isUncertain: !dayMatch[2],
        rawMatched: dayMatch[0],
      };
    }
  }

  // Explicit date formats e.g. "by Oct 12", "before 2026-10-15"
  const explicitDateMatch = text.match(/\b(?:by|before|due(?:\s+on)?)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{4}-\d{2}-\d{2})\b/i);
  if (explicitDateMatch) {
    const cleanedDate = explicitDateMatch[1].replace(/(?:st|nd|rd|th)/g, '');
    const parsed = new Date(cleanedDate);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(18, 0, 0, 0);
      const diffHours = (parsed.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
      return {
        canonicalIso: parsed.toISOString(),
        formatted: format(parsed, 'MMM d, yyyy h:mm a'),
        isImminent: diffHours >= 0 && diffHours <= imminentHoursThreshold,
        isUncertain: false,
        rawMatched: explicitDateMatch[0],
      };
    }
  }

  // Uncertain expressions: "sometime next week", "later this month", "at some point"
  const uncertainMatch = text.match(/\b(sometime\s+next\s+week|later\s+(?:this|next)\s+week|eventually|at\s+some\s+point|whenever\s+you\s+can)\b/i);
  if (uncertainMatch) {
    const target = addDays(baseDate, 7);
    return {
      canonicalIso: target.toISOString(),
      formatted: 'Flexible / Unspecified',
      isImminent: false,
      isUncertain: true,
      rawMatched: uncertainMatch[0],
    };
  }

  return null;
}

function parseHours(hourStr: string, ampm?: string): number {
  let h = parseInt(hourStr, 10);
  if (ampm) {
    const lower = ampm.toLowerCase();
    if (lower === 'pm' && h < 12) h += 12;
    if (lower === 'am' && h === 12) h = 0;
  } else if (h <= 6) {
    // If just "5" without am/pm, default to 17:00 (5 PM in work chat)
    h += 12;
  }
  return h;
}
