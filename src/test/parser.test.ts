import { describe, it, expect } from 'vitest';
import { parseChatLog } from '../lib/parser/chatParser';

describe('Chat Parser', () => {
  it('parses standard bracketed timestamp format', () => {
    const raw = `[2026-10-09 09:15:20] Alice: Hello world!
[2026-10-09 09:16:00] Bob: Hey Alice, how are you?`;

    const result = parseChatLog(raw);
    expect(result.success).toBe(true);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe('Alice');
    expect(result.messages[0].text).toBe('Hello world!');
    expect(result.messages[1].sender).toBe('Bob');
    expect(result.senders).toContain('Alice');
    expect(result.senders).toContain('Bob');
  });

  it('parses WhatsApp export format', () => {
    const raw = `10/09/2026, 09:15 - Alice: Hey everyone!
10/09/2026, 09:16 - Charlie: Good morning team`;

    const result = parseChatLog(raw);
    expect(result.success).toBe(true);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe('Alice');
    expect(result.messages[1].sender).toBe('Charlie');
  });

  it('correctly handles multiline messages with code blocks and bullet points', () => {
    const raw = `[2026-10-09 10:00:00] Dev: Here is the code snippet:
const x = 10;
const y = 20;
return x + y;
[2026-10-09 10:01:00] Reviewer: Looks good to me!`;

    const result = parseChatLog(raw);
    expect(result.success).toBe(true);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].text).toContain('const x = 10;');
    expect(result.messages[0].text).toContain('return x + y;');
    expect(result.messages[1].sender).toBe('Reviewer');
  });

  it('parses JSON formatted chat exports', () => {
    const json = JSON.stringify([
      { sender: 'Alice', timestamp: '2026-10-09T09:00:00.000Z', text: 'Task 1' },
      { sender: 'Bob', timestamp: '2026-10-09T09:05:00.000Z', text: 'Task 2' },
    ]);

    const result = parseChatLog(json);
    expect(result.success).toBe(true);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe('Alice');
  });

  it('gracefully fails for empty content with descriptive error', () => {
    const result = parseChatLog('   ');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('empty');
  });

  it('rejects malformed text that has no recognizable chat structure', () => {
    const result = parseChatLog('Random unstructured poem without timestamps or senders');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Could not detect standard chat messages');
  });
});
