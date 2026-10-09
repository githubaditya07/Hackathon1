import { Message, ParseResult } from '../../types';
import { stripControlCharacters, MAX_MESSAGES_COUNT, MAX_MESSAGE_TEXT_LENGTH } from '../security/sanitizer';

/**
 * Regex patterns for various chat log export formats.
 */
// Format 1: [YYYY-MM-DD HH:mm:ss] Sender: Message OR [MM/DD/YYYY, HH:mm] Sender: Message
const BRACKET_PATTERN = /^\[(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]+(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?))\]\s*([^:]+?):\s*(.*)$/;

// Format 2: MM/DD/YYYY, HH:mm - Sender: Message (WhatsApp export style)
const WHATSAPP_PATTERN = /^(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*[-–]\s*([^:]+?):\s*(.*)$/;

// Format 3: YYYY-MM-DD HH:mm:ss Sender: Message (Slack/IRC style)
const PLAIN_TIMESTAMP_PATTERN = /^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}[T\s]\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s+([^:]+?):\s*(.*)$/;

/**
 * Normalizes date strings to ISO 8601 string.
 * Falls back to now or sanitized original if parsing fails.
 */
export function normalizeTimestamp(raw: string, fallbackAnchorDate?: Date): string {
  try {
    const cleaned = raw.trim().replace(/,/g, '');
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    // Try handling DD/MM/YYYY or MM/DD/YYYY variations
    const parts = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?.*)$/);
    if (parts) {
      const [, p1, p2, yearRaw, time] = parts;
      const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
      // Try YYYY-MM-DD
      const candidate1 = new Date(`${year}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')} ${time}`);
      if (!isNaN(candidate1.getTime())) return candidate1.toISOString();
      const candidate2 = new Date(`${year}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')} ${time}`);
      if (!isNaN(candidate2.getTime())) return candidate2.toISOString();
    }
  } catch {
    // ignore
  }

  return (fallbackAnchorDate || new Date()).toISOString();
}

/**
 * Parses raw text content into structured Message records.
 */
export function parseChatLog(rawContent: string, currentUserName?: string): ParseResult {
  const sanitized = stripControlCharacters(rawContent);
  const errors: string[] = [];
  const warnings: string[] = [];
  const messages: Message[] = [];
  const sendersSet = new Set<string>();

  if (!sanitized || sanitized.trim().length === 0) {
    return {
      success: false,
      messages: [],
      errors: ['The provided conversation content is empty.'],
      warnings: [],
      senders: [],
    };
  }

  // 1. Try parsing as JSON first
  const trimmed = sanitized.trim();
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const items = Array.isArray(parsedJson) ? parsedJson : parsedJson.messages || parsedJson.data;

      if (Array.isArray(items) && items.length > 0) {
        items.slice(0, MAX_MESSAGES_COUNT).forEach((item, index) => {
          const sender = String(item.sender || item.author || item.user || 'Unknown').trim();
          const text = String(item.text || item.message || item.content || '').trim().slice(0, MAX_MESSAGE_TEXT_LENGTH);
          const rawTime = String(item.timestamp || item.time || item.date || new Date().toISOString());
          const isoTime = normalizeTimestamp(rawTime);

          if (text) {
            sendersSet.add(sender);
            const isUserSender = currentUserName ? sender.toLowerCase() === currentUserName.toLowerCase() : false;
            messages.push({
              id: `msg-json-${index + 1}-${Date.now().toString(36)}`,
              sender,
              timestamp: isoTime,
              text,
              isUserSender,
              metadata: { rawTimestamp: rawTime, lineNumber: index + 1 },
            });
          }
        });

        if (messages.length > 0) {
          return {
            success: true,
            messages,
            errors,
            warnings,
            senders: Array.from(sendersSet),
            startDate: messages[0].timestamp,
            endDate: messages[messages.length - 1].timestamp,
          };
        }
      }
    } catch {
      // Not JSON or invalid JSON, fall through to line-by-line plain text parsing
    }
  }

  // 2. Line-by-line plaintext parsing with multiline buffer
  const lines = sanitized.split(/\r?\n/);
  let currentMsg: {
    sender: string;
    rawTime: string;
    isoTime: string;
    textLines: string[];
    lineNumber: number;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    if (messages.length >= MAX_MESSAGES_COUNT) {
      warnings.push(`File exceeded the maximum message cap. Parsed first ${MAX_MESSAGES_COUNT} messages.`);
      break;
    }

    const line = lines[i];
    if (!line.trim() && !currentMsg) continue;

    let matchedTime: string | null = null;
    let matchedSender: string | null = null;
    let matchedText: string | null = null;

    // Check Format 1 (Bracketed)
    const m1 = line.match(BRACKET_PATTERN);
    if (m1) {
      matchedTime = m1[1];
      matchedSender = m1[2].trim();
      matchedText = m1[3];
    } else {
      // Check Format 2 (WhatsApp)
      const m2 = line.match(WHATSAPP_PATTERN);
      if (m2) {
        matchedTime = m2[1];
        matchedSender = m2[2].trim();
        matchedText = m2[3];
      } else {
        // Check Format 3 (Plain timestamp)
        const m3 = line.match(PLAIN_TIMESTAMP_PATTERN);
        if (m3) {
          matchedTime = m3[1];
          matchedSender = m3[2].trim();
          matchedText = m3[3];
        }
      }
    }

    if (matchedTime && matchedSender && matchedText !== null) {
      // Flush previous message if any
      if (currentMsg) {
        const fullText = currentMsg.textLines.join('\n').trim().slice(0, MAX_MESSAGE_TEXT_LENGTH);
        if (fullText) {
          sendersSet.add(currentMsg.sender);
          const isUser = currentUserName ? currentMsg.sender.toLowerCase() === currentUserName.toLowerCase() : false;
          messages.push({
            id: `msg-${messages.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
            sender: currentMsg.sender,
            timestamp: currentMsg.isoTime,
            text: fullText,
            isUserSender: isUser,
            metadata: {
              rawTimestamp: currentMsg.rawTime,
              lineNumber: currentMsg.lineNumber,
            },
          });
        }
      }

      currentMsg = {
        sender: matchedSender,
        rawTime: matchedTime,
        isoTime: normalizeTimestamp(matchedTime),
        textLines: [matchedText],
        lineNumber: i + 1,
      };
    } else if (currentMsg) {
      // Continuation of multiline message
      currentMsg.textLines.push(line);
    } else {
      // Unrecognized leading line before any message header
      if (line.trim().length > 0 && messages.length === 0) {
        // Ignore headers like "Chat exported on..." or log headers
      }
    }
  }

  // Flush the final message
  if (currentMsg) {
    const fullText = currentMsg.textLines.join('\n').trim().slice(0, MAX_MESSAGE_TEXT_LENGTH);
    if (fullText) {
      sendersSet.add(currentMsg.sender);
      const isUser = currentUserName ? currentMsg.sender.toLowerCase() === currentUserName.toLowerCase() : false;
      messages.push({
        id: `msg-${messages.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
        sender: currentMsg.sender,
        timestamp: currentMsg.isoTime,
        text: fullText,
        isUserSender: isUser,
        metadata: {
          rawTimestamp: currentMsg.rawTime,
          lineNumber: currentMsg.lineNumber,
        },
      });
    }
  }

  if (messages.length === 0) {
    errors.push(
      'Could not detect standard chat messages. Please ensure lines follow formats like "[YYYY-MM-DD HH:mm] Sender: message" or "DD/MM/YYYY, HH:mm - Sender: message".'
    );
    return {
      success: false,
      messages: [],
      errors,
      warnings,
      senders: [],
    };
  }

  return {
    success: true,
    messages,
    errors,
    warnings,
    senders: Array.from(sendersSet),
    startDate: messages[0]?.timestamp,
    endDate: messages[messages.length - 1]?.timestamp,
  };
}
