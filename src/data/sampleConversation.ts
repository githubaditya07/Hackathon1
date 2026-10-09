import { Conversation } from '../types';

export const SAMPLE_CHAT_RAW = `[2026-10-09 09:15:20] Sarah: Good morning team! Hackathon submission is tonight. Let's do a quick sync on where everyone is at.
[2026-10-09 09:16:04] Marcus: Morning. Infra is set up. I verified our local development build works cleanly offline.
[2026-10-09 09:17:30] Priya: Morning Sarah. I finished the database schema migrations and all storage unit tests pass. IndexedDB fallback is tested as well.
[2026-10-09 09:18:12] Sarah: Awesome work Priya! That unblocks the whole data layer.
[2026-10-09 09:20:00] David: Hey everyone, I just finalized the UI designs for the Action Center and the Privacy Dashboard. Should we use the purple accent or indigo?
[2026-10-09 09:21:15] Sarah: Indigo matches the Raycast/Linear aesthetic much better. Let's go with indigo.
[2026-10-09 09:21:40] David: Agreed: We're locking in indigo accents and deep charcoal cards.
[2026-10-09 09:23:05] Marcus: Quick reminder: The official project submission deadline is today at 6:00 PM. We must submit the repository and video before 6pm today.
[2026-10-09 09:24:22] Sarah: @Alex, critical item for you: can you please verify the local chat parser regexes and implement the temporal date resolver before 2:00 PM today?
[2026-10-09 09:25:00] Sarah: Alex we need you to make sure the evidence links jump smoothly to the source message. That's a core judging criteria.
[2026-10-09 09:26:45] Priya: I can pair with Alex on the test fixtures if needed.
[2026-10-09 09:30:10] Marcus: Has anyone tested the Web Worker memory footprint on Firefox?
[2026-10-09 09:35:12] Elena: Hey guys, jumping in. What if we added an external cloud summarizer as an option?
[2026-10-09 09:36:40] Sarah: No, the hackathon rules explicitly mandate strict local-first privacy. Absolutely zero user messages can leave the device.
[2026-10-09 09:37:25] Marcus: +1 to Sarah. We decided to keep processing 100% on-device with zero external API calls.
[2026-10-09 09:37:50] Priya: Agreed, 100% on-device is our biggest competitive differentiator for user privacy.
[2026-10-09 09:40:15] Elena: Understood, totally agree that's much safer!
[2026-10-09 10:05:00] David: Pizza and coffee just arrived at the table! No rush, take a break whenever you want.
[2026-10-09 10:15:30] Sarah: Thanks David! Reminder to everyone: code freeze is by 5:00 PM today so we have an hour for final polish.
[2026-10-09 10:45:10] Priya: I will write the Vitest unit tests for the regex parsers and date math right now.
[2026-10-09 11:10:05] Marcus: I am going to prepare the offline demonstration video script.
[2026-10-09 11:30:20] Elena: We might want to revisit the mobile layout sometime next week if we have extra time, but desktop is our main priority for the demo.
[2026-10-09 11:45:00] Sarah: @Alex could you also review Priya's PR once she finishes the tests?
[2026-10-09 12:00:15] David: Action item: export high-res product screenshots for the README and slide deck.
[2026-10-09 12:15:40] Priya: PR #4 is up with 15 passing tests! Alex, take a look when you're back from lunch.`;

export function getSampleConversation(): Conversation {
  return {
    id: 'conv-sample-hackathon-2026',
    title: 'Hackathon Final Sprint — Team Sync',
    importedAt: '2026-10-09T06:45:00.000Z',
    messageCount: 25,
    senders: ['Sarah', 'Marcus', 'Priya', 'David', 'Elena'],
    startDate: '2026-10-09T03:45:20.000Z',
    endDate: '2026-10-09T06:45:40.000Z',
    isSample: true,
    messages: [
      {
        id: 'msg-s-1',
        sender: 'Sarah',
        timestamp: '2026-10-09T03:45:20.000Z',
        text: "Good morning team! Hackathon submission is tonight. Let's do a quick sync on where everyone is at.",
      },
      {
        id: 'msg-s-2',
        sender: 'Marcus',
        timestamp: '2026-10-09T03:46:04.000Z',
        text: 'Morning. Infra is set up. I verified our local development build works cleanly offline.',
      },
      {
        id: 'msg-s-3',
        sender: 'Priya',
        timestamp: '2026-10-09T03:47:30.000Z',
        text: 'Morning Sarah. I finished the database schema migrations and all storage unit tests pass. IndexedDB fallback is tested as well.',
      },
      {
        id: 'msg-s-4',
        sender: 'Sarah',
        timestamp: '2026-10-09T03:48:12.000Z',
        text: 'Awesome work Priya! That unblocks the whole data layer.',
      },
      {
        id: 'msg-s-5',
        sender: 'David',
        timestamp: '2026-10-09T03:50:00.000Z',
        text: 'Hey everyone, I just finalized the UI designs for the Action Center and the Privacy Dashboard. Should we use the purple accent or indigo?',
      },
      {
        id: 'msg-s-6',
        sender: 'Sarah',
        timestamp: '2026-10-09T03:51:15.000Z',
        text: "Indigo matches the Raycast/Linear aesthetic much better. Let's go with indigo.",
      },
      {
        id: 'msg-s-7',
        sender: 'David',
        timestamp: '2026-10-09T03:51:40.000Z',
        text: "Agreed: We're locking in indigo accents and deep charcoal cards.",
      },
      {
        id: 'msg-s-8',
        sender: 'Marcus',
        timestamp: '2026-10-09T03:53:05.000Z',
        text: 'Quick reminder: The official project submission deadline is today at 6:00 PM. We must submit the repository and video before 6pm today.',
      },
      {
        id: 'msg-s-9',
        sender: 'Sarah',
        timestamp: '2026-10-09T03:54:22.000Z',
        text: '@Alex, critical item for you: can you please verify the local chat parser regexes and implement the temporal date resolver before 2:00 PM today?',
      },
      {
        id: 'msg-s-10',
        sender: 'Sarah',
        timestamp: '2026-10-09T03:55:00.000Z',
        text: "Alex we need you to make sure the evidence links jump smoothly to the source message. That's a core judging criteria.",
      },
      {
        id: 'msg-s-11',
        sender: 'Priya',
        timestamp: '2026-10-09T03:56:45.000Z',
        text: 'I can pair with Alex on the test fixtures if needed.',
      },
      {
        id: 'msg-s-12',
        sender: 'Marcus',
        timestamp: '2026-10-09T04:00:10.000Z',
        text: 'Has anyone tested the Web Worker memory footprint on Firefox?',
      },
      {
        id: 'msg-s-13',
        sender: 'Elena',
        timestamp: '2026-10-09T04:05:12.000Z',
        text: 'Hey guys, jumping in. What if we added an external cloud summarizer as an option?',
      },
      {
        id: 'msg-s-14',
        sender: 'Sarah',
        timestamp: '2026-10-09T04:06:40.000Z',
        text: 'No, the hackathon rules explicitly mandate strict local-first privacy. Absolutely zero user messages can leave the device.',
      },
      {
        id: 'msg-s-15',
        sender: 'Marcus',
        timestamp: '2026-10-09T04:07:25.000Z',
        text: '+1 to Sarah. We decided to keep processing 100% on-device with zero external API calls.',
      },
      {
        id: 'msg-s-16',
        sender: 'Priya',
        timestamp: '2026-10-09T04:07:50.000Z',
        text: "Agreed, 100% on-device is our biggest competitive differentiator for user privacy.",
      },
      {
        id: 'msg-s-17',
        sender: 'Elena',
        timestamp: '2026-10-09T04:10:15.000Z',
        text: "Understood, totally agree that's much safer!",
      },
      {
        id: 'msg-s-18',
        sender: 'David',
        timestamp: '2026-10-09T04:35:00.000Z',
        text: 'Pizza and coffee just arrived at the table! No rush, take a break whenever you want.',
      },
      {
        id: 'msg-s-19',
        sender: 'Sarah',
        timestamp: '2026-10-09T04:45:10.000Z',
        text: 'Thanks David! Reminder to everyone: code freeze is by 5:00 PM today so we have an hour for final polish.',
      },
      {
        id: 'msg-s-20',
        sender: 'Priya',
        timestamp: '2026-10-09T05:15:10.000Z',
        text: 'I will write the Vitest unit tests for the regex parsers and date math right now.',
      },
      {
        id: 'msg-s-21',
        sender: 'Marcus',
        timestamp: '2026-10-09T05:40:05.000Z',
        text: 'I am going to prepare the offline demonstration video script.',
      },
      {
        id: 'msg-s-22',
        sender: 'Elena',
        timestamp: '2026-10-09T06:00:20.000Z',
        text: 'We might want to revisit the mobile layout sometime next week if we have extra time, but desktop is our main priority for the demo.',
      },
      {
        id: 'msg-s-23',
        sender: 'Sarah',
        timestamp: '2026-10-09T06:15:00.000Z',
        text: "@Alex could you also review Priya's PR once she finishes the tests?",
      },
      {
        id: 'msg-s-24',
        sender: 'David',
        timestamp: '2026-10-09T06:30:15.000Z',
        text: 'Action item: export high-res product screenshots for the README and slide deck.',
      },
      {
        id: 'msg-s-25',
        sender: 'Priya',
        timestamp: '2026-10-09T06:45:40.000Z',
        text: "PR #4 is up with 15 passing tests! Alex, take a look when you're back from lunch.",
      },
    ],
  };
}
