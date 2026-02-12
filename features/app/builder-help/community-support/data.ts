export const posts = [
  {
    id: "p1",
    title: "Feeling stuck on insulation choices.",
    body: "I keep bouncing between foam and wool. Any real-world tips?",
    user: "@VanLifeNewbie",
    timestamp: "3h ago",
    verifiedReply: {
      user: "@BuilderPro",
      timestamp: "2h ago",
      text: "Go with closed-cell foam for moisture resistance.",
    },
    comments: [
      {
        id: "c1",
        user: "@Nomad123",
        timestamp: "2h ago",
        text: "I used wool, works fine!",
        likes: 12,
        replies: [
          {
            id: "c1-1",
            user: "@BuilderPro",
            timestamp: "90m ago",
            text: "Wool is comfy, just watch moisture barriers.",
            likes: 4,
          },
        ],
      },
      {
        id: "c2",
        user: "@DIYer",
        timestamp: "1h ago",
        text: "Foam is easier to install.",
        likes: 7,
        replies: [],
      },
    ],
  },
  {
    id: "p2",
    title: "Need help routing wiring for lights.",
    body: "Any tips to avoid sagging runs over time?",
    user: "@TrailBuilt",
    timestamp: "5h ago",
    verifiedReply: {
      user: "@WireGuru",
      timestamp: "4h ago",
      text: "Hang in there, wiring issues are common. Here’s a checklist.",
    },
    comments: [
      {
        id: "c3",
        user: "@RangerBuilt",
        timestamp: "4h ago",
        text: "Use adhesive mounts every 10-12 inches.",
        likes: 9,
        replies: [],
      },
    ],
  },
];
