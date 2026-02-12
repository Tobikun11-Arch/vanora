export const guides = [
  {
    id: "solar",
    title: "Installing Solar Panels",
    description:
      "A straightforward guide to mounting, wiring, and testing a solar setup that is safe for long-term travel.",
    author: "@BuilderPro",
    timestamp: "1d ago",
    verified: true,
    steps: [
      "Mount brackets securely and seal all penetrations.",
      "Connect wiring harness and route cables cleanly.",
      "Test voltage output before final tie-down.",
    ],
    tips: [
      "Use anti-corrosion paste on terminals in humid climates.",
      "Leave service loops for future maintenance.",
    ],
    comments: [
      {
        id: "c1",
        user: "@Nomad123",
        timestamp: "6h ago",
        text: "Worked perfectly, thanks!",
        replies: [],
      },
      {
        id: "c2",
        user: "@DIYer",
        timestamp: "4h ago",
        text: "Any tips for smaller vans?",
        replies: [
          {
            id: "c2-1",
            user: "@BuilderPro",
            timestamp: "2h ago",
            verified: true,
            text: "Use flexible panels for tight spaces.",
          },
        ],
      },
    ],
  },
  {
    id: "insulation",
    title: "Choosing Insulation Materials",
    description:
      "Compare foam, wool, and polyiso with real-world moisture and weight tradeoffs.",
    author: "@BuildCraft",
    timestamp: "3d ago",
    verified: false,
    steps: [
      "Measure cavities and note condensation risk zones.",
      "Choose a primary insulation and seal vapor gaps.",
      "Install acoustic layers where panels resonate.",
    ],
    tips: ["Closed-cell foam resists moisture better than fibrous options."],
    comments: [
      {
        id: "c3",
        user: "@TrailBuilt",
        timestamp: "1d ago",
        text: "Really helpful for planning my budget.",
        replies: [],
      },
    ],
  },
  {
    id: "water",
    title: "Water System Plumbing",
    description:
      "Step-by-step guide to sizing tanks, routing hoses, and pressure testing.",
    author: "@PipeSensei",
    timestamp: "5d ago",
    verified: true,
    steps: [
      "Fit tanks with proper supports and straps.",
      "Route hoses with smooth bends to reduce leaks.",
      "Pressurize and check fittings for drips.",
    ],
    tips: ["Install shutoff valves near each major fixture."],
    comments: [],
  },
];
