export const getRoadAlerts = (userLocation: string) => [
  {
    id: "1",
    title: `${userLocation} Area - Main Corridor`,
    detail: `Traffic slowdown reported near ${userLocation}. Expect delays for the next 2 hours.`,
    color: "#f43f5e",
  },
  {
    id: "2",
    title: `${userLocation} Scenic Route`,
    detail: `Road work ahead outside ${userLocation}. Single-lane traffic and short stops.`,
    color: "#f59e0b",
  },
];

export const getFeaturedNews = (userLocation: string) => ({
  title: `10 Best Hidden Boondocking Spots Near ${userLocation}`,
  tag: "EDITOR'S CHOICE",
  image: require("../../assets/images/featured_news.jpg"),
});

export const newsItems = [
  {
    id: "1",
    title: "Essential Solar Upgrades for Winter Living",
    category: "TECH + GEAR",
    time: "2 hours ago",
    read: "5 min read",
    image: require("../../assets/images/solar_van.jpg"),
  },
  {
    id: "2",
    title: "How to Build a Cozy Van Desk Setup",
    category: "WORK LIFE",
    time: "Yesterday",
    read: "4 min read",
    image: require("../../assets/images/cozy_van.jpg"),
  },
];

export const communitySpotlight = [
  {
    id: "1",
    name: "Jis & Luna",
    subtitle: "Full-timing since 2021",
    image: require("../../assets/images/duo_camper.jpg"),
    location: "Sedona, AZ",
    journey: "Desert loops, red rock camps, and weekly sunrise hikes.",
  },
  {
    id: "2",
    name: "Elena Wild",
    subtitle: "Solo Sprinter Builder",
    image: require("../../assets/images/solo_camper.jpg"),
    location: "Bend, OR",
    journey: "Mountain trails by day, wood-stove nights by the river.",
  },
  {
    id: "3",
    name: "Theo & Mina",
    subtitle: "Weekend Warriors",
    image: require("../../assets/images/theo.jpg"),
    location: "Bozeman, MT",
    journey: "Quick escapes, hot springs stops, and ski weekends.",
  },
  {
    id: "4",
    name: "Riley Stone",
    subtitle: "Remote Dev on Wheels",
    image: require("../../assets/images/stones.jpg"),
    location: "Asheville, NC",
    journey: "Coffee shop code sprints and Blue Ridge overnights.",
  },
  {
    id: "5",
    name: "Aria & Pax",
    subtitle: "Family Micro-Adventure",
    image: require("../../assets/images/aria.jpg"),
    location: "Moab, UT",
    journey: "School-on-the-road and nightly campfire stories.",
  },
  {
    id: "6",
    name: "Noah Reyes",
    subtitle: "Budget Build Enthusiast",
    image: require("../../assets/images/Noah.jpg"),
    location: "Flagstaff, AZ",
    journey: "DIY upgrades and forest service road exploring.",
  },
];

export const roadQuests = [
  {
    id: "rq1",
    title: "Sunrise Over Water",
    points: 120,
    time: "Ends in 2d 6h",
    players: 248,
    tag: "WEEKLY",
  },
  {
    id: "rq2",
    title: "Best Campfire Coffee",
    points: 90,
    time: "Ends in 5d 1h",
    players: 193,
    tag: "COMMUNITY",
  },
  {
    id: "rq3",
    title: "Odd Roadside Attraction",
    points: 150,
    time: "Ends in 1d 4h",
    players: 322,
    tag: "TRENDING",
  },
];

export const vanBingoCards = [
  {id: "vb1", title: "Forest Service Road", progress: 3, total: 5},
  {id: "vb2", title: "Free Campfire Ring", progress: 4, total: 5},
  {id: "vb3", title: "Meet Another Vanlifer", progress: 2, total: 5},
];

export const leaderboard = [
  {
    id: "lb1",
    name: "Riley Stone",
    points: 1280,
    badge: "Trail Captain",
    image: communitySpotlight[3].image,
  },
  {
    id: "lb2",
    name: "Jis & Luna",
    points: 1195,
    badge: "Sunrise Hunter",
    image: communitySpotlight[0].image,
  },
  {
    id: "lb3",
    name: "Elena Wild",
    points: 1080,
    badge: "Route Scout",
    image: communitySpotlight[1].image,
  },
  {
    id: "lb4",
    name: "Theo & Mina",
    points: 990,
    badge: "Campfire Pro",
    image: communitySpotlight[2].image,
  },
  {
    id: "lb5",
    name: "Aria & Pax",
    points: 920,
    badge: "Family Voyager",
    image: communitySpotlight[4].image,
  },
];
