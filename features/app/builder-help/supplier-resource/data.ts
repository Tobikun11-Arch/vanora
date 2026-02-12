export const suppliers = [
  {
    id: "solarvan",
    name: "SolarVan Co.",
    icon: "solar-power-variant-outline",
    category: "Solar Panels",
    contact: "solarvan.com",
    verifiedReview: {
      user: "@BuilderPro",
      text: "Panels are durable, great for off-grid setups.",
    },
    comments: [
      {
        id: "c1",
        user: "@Nomad123",
        time: "2h ago",
        text: "Shipping was fast!",
        replies: [
          {
            id: "c1-1",
            user: "@BuilderPro",
            time: "1h ago",
            text: "Agree. They shipped in 3 days for me.",
          },
        ],
      },
      {
        id: "c2",
        user: "@DIYer",
        time: "5h ago",
        text: "Any cheaper alternatives?",
        replies: [
          {
            id: "c2-1",
            user: "@VanLab",
            time: "4h ago",
            text: "Check SunVolt; slightly less output but affordable.",
          },
        ],
      },
    ],
  },
  {
    id: "voltcraft",
    name: "VoltCraft Supply",
    icon: "flash-outline",
    category: "Electrical",
    contact: "voltcraft.io",
    verifiedReview: {
      user: "@WireGuru",
      text: "I’ve used this supplier for wiring kits, reliable quality.",
    },
    comments: [
      {
        id: "c3",
        user: "@RangerBuilt",
        time: "1d ago",
        text: "Their fuse blocks are solid.",
        replies: [],
      },
      {
        id: "c4",
        user: "@Switchback",
        time: "18h ago",
        text: "Any bulk discount details?",
        replies: [
          {
            id: "c4-1",
            user: "@WireGuru",
            time: "12h ago",
            text: "Ask support; they gave 8% off on my last order.",
          },
        ],
      },
    ],
  },
  {
    id: "timberline",
    name: "Timberline Works",
    icon: "hammer-screwdriver",
    category: "Carpentry",
    contact: "timberlineworks.com",
    verifiedReview: {
      user: "@BuildCraft",
      text: "Great hardwood panels and consistent finish.",
    },
    comments: [
      {
        id: "c5",
        user: "@RoadWood",
        time: "2d ago",
        text: "Love the walnut options.",
        replies: [],
      },
    ],
  },
];
