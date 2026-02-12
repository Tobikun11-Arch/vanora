export const question = {
  title: "How do I fix wiring issues in my van?",
  user: "VanLifeNewbie",
  timestamp: "2h ago",
};

export const answer = {
  user: "John Elemor",
  timestamp: "1h ago",
  text: "Check your fuse box first, then trace the wiring harness. Look for loose terminals, heat discoloration, or frayed runs. Test continuity at each segment and re-crimp any weak connections.",
};

export const comments = [
  {
    id: "c1",
    user: "DIYer",
    timestamp: "50m ago",
    text: "This worked for me too!",
  },
  {
    id: "c2",
    user: "Nomad123",
    timestamp: "35m ago",
    text: "Any tips for solar setups?",
    replies: [
      {
        id: "c2-1",
        user: "BuilderPro",
        verified: true,
        timestamp: "30m ago",
        text: "Yes, start with a clean panel layout, then size your controller for peak amps and leave room for expansion.",
      },
    ],
  },
];
