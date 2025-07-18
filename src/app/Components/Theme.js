import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export const PreThemes = {
  dark: {
    id: "dark",
    name: "Dark Theme",
    description: "Easy on the eyes, perfect for night work",
    colors: {
      primary: "#00A99D",
      background: "#1B212C",
      secondary: "#151B24",
      text: "#E1E6EB",
      textSecondary: "#A0AEC0",
      border: "#A0AEC0",
      accent: "#00A99D",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: Moon,
  },
  light: {
    id: "light",
    name: "Light Theme",
    description: "Clean and bright, great for daytime",
    colors: {
      primary: "#00A99D",
      background: "#FFFFFF",
      secondary: "#F7FAFC",
      text: "#1A202C",
      textSecondary: "#4A5568",
      border: "#E2E8F0",
      accent: "#00A99D",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: Sun,
  },
  system: {
    id: "system",
    name: "System",
    description: "Follows your system preference",
    colors: {}, // Will inherit from system
    icon: Monitor,
  },
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calming blue tones",
    colors: {
      primary: "#0EA5E9",
      background: "#0F172A",
      secondary: "#1E293B",
      text: "#F1F5F9",
      textSecondary: "#94A3B8",
      border: "#334155",
      accent: "#0EA5E9",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-blue-400 rounded-full"></div>,
  },
  forest: {
    id: "forest",
    name: "Forest Green",
    description: "Natural green environment",
    colors: {
      primary: "#10B981",
      background: "#0F1C14",
      secondary: "#1A2E1A",
      text: "#F0FDF4",
      textSecondary: "#86EFAC",
      border: "#22543D",
      accent: "#10B981",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-green-400 rounded-full"></div>,
  },
  sunset: {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm orange and red tones",
    colors: {
      primary: "#F97316",
      background: "#1C1917",
      secondary: "#292524",
      text: "#FEF7ED",
      textSecondary: "#FDBA74",
      border: "#78716C",
      accent: "#F97316",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-orange-400 rounded-full"></div>,
  },  mocha: {
    id: "mocha",
    name: "Mocha",
    description: "Rich coffee-inspired warm browns",
    colors: {
      primary: "#D2691E",
      background: "#3E2723",
      secondary: "#5D4037",
      text: "#F5F5DC",
      textSecondary: "#D7CCC8",
      border: "#A1887F",
      accent: "#BF8556",
      success: "#81C784",
      warning: "#FFB74D",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-amber-600 rounded-full"></div>,
  },

  rose: {
    id: "rose",
    name: "Rose",
    description: "Elegant rose pink tones",
    colors: {
      primary: "#E11D48",
      background: "#3F0D1D",
      secondary: "#5B1D2E",
      text: "#FFE4E6",
      textSecondary: "#FBCFE8",
      border: "#BE123C",
      accent: "#F43F5E",
      success: "#22C55E",
      warning: "#FACC15",
      error: "#DC2626",
    },
    icon: () => <div className="w-4 h-4 bg-rose-500 rounded-full"></div>,
  },

  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon-bright futuristic colors",
    colors: {
      primary: "#FF00FF",
      background: "#0F0F0F",
      secondary: "#1A1A1A",
      text: "#F8F8F2",
      textSecondary: "#FF79C6",
      border: "#BD93F9",
      accent: "#50FA7B",
      success: "#50FA7B",
      warning: "#F1FA8C",
      error: "#FF5555",
    },
    icon: () => <div className="w-4 h-4 bg-fuchsia-500 rounded-full"></div>,
  },  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Deep midnight blue darkness",
    colors: {
      primary: "#1E40AF",
      background: "#0B1120",
      secondary: "#1E293B",
      text: "#E2E8F0",
      textSecondary: "#94A3B8",
      border: "#334155",
      accent: "#3B82F6",
      success: "#16A34A",
      warning: "#FACC15",
      error: "#DC2626",
    },
    icon: () => <div className="w-4 h-4 bg-blue-900 rounded-full"></div>,
  },

  latte: {
    id: "latte",
    name: "Latte",
    description: "Creamy coffee latte tones",
    colors: {
      primary: "#C49E85",
      background: "#FFF8F0",
      secondary: "#F5E9DF",
      text: "#3E2C29",
      textSecondary: "#8B6D61",
      border: "#D3B8A3",
      accent: "#D4A373",
      success: "#81C784",
      warning: "#FFB74D",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-amber-300 rounded-full"></div>,
  },
  forestDark: {
    id: "forestDark",
    name: "Forest Dark",
    description: "Deep forest green darkness",
    colors: {
      primary: "#2F855A",
      background: "#1B4332",
      secondary: "#2D6A4F",
      text: "#D8F3DC",
      textSecondary: "#B7E4C7",
      border: "#95D5B2",
      accent: "#40916C",
      success: "#2F855A",
      warning: "#FFD166",
      error: "#E63946",
    },
    icon: () => <div className="w-4 h-4 bg-green-700 rounded-full"></div>,
  },

  sky: {
    id: "sky",
    name: "Sky",
    description: "Clear blue sky brightness",
    colors: {
      primary: "#0EA5E9",
      background: "#E0F7FA",
      secondary: "#B2EBF2",
      text: "#0F172A",
      textSecondary: "#0284C7",
      border: "#7DD3FC",
      accent: "#38BDF8",
      success: "#22C55E",
      warning: "#FBBF24",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-sky-400 rounded-full"></div>,
  },
  vintage: {
    id: "vintage",
    name: "Vintage",
    description: "Classic vintage sepia tones",
    colors: {
      primary: "#8D6E63",
      background: "#FAF3E0",
      secondary: "#EEDFCC",
      text: "#3E2723",
      textSecondary: "#A1887F",
      border: "#D7CCC8",
      accent: "#D2B48C",
      success: "#81C784",
      warning: "#FFD54F",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-amber-700 rounded-full"></div>,
  },

  ember: {
    id: "ember",
    name: "Ember",
    description: "Glowing ember orange warmth",
    colors: {
      primary: "#FF6F00",
      background: "#1A120B",
      secondary: "#261C15",
      text: "#FFE0B2",
      textSecondary: "#FFB74D",
      border: "#FF9800",
      accent: "#FB8C00",
      success: "#66BB6A",
      warning: "#FFA726",
      error: "#D32F2F",
    },
    icon: () => <div className="w-4 h-4 bg-orange-600 rounded-full"></div>,
  },

  grape: {
    id: "grape",
    name: "Grape",
    description: "Rich grape purple luxury",
    colors: {
      primary: "#9D4EDD",
      background: "#240046",
      secondary: "#3C096C",
      text: "#E0AAFF",
      textSecondary: "#C77DFF",
      border: "#9D4EDD",
      accent: "#7B2CBF",
      success: "#00C896",
      warning: "#FFD60A",
      error: "#FF3E00",
    },
    icon: () => <div className="w-4 h-4 bg-purple-600 rounded-full"></div>,
  },
  silver: {
    id: "silver",
    name: "Silver",
    description: "Elegant silver metallic tones",
    colors: {
      primary: "#9CA3AF",
      background: "#F3F4F6",
      secondary: "#E5E7EB",
      text: "#1F2937",
      textSecondary: "#6B7280",
      border: "#D1D5DB",
      accent: "#A1A1AA",
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F87171",
    },
    icon: () => <div className="w-4 h-4 bg-gray-400 rounded-full"></div>,
  },
  desert: {
    id: "desert",
    name: "Desert",
    description: "Warm desert sand colors",
    colors: {
      primary: "#D97706",
      background: "#FFF7ED",
      secondary: "#FFEBCB",
      text: "#78350F",
      textSecondary: "#B45309",
      border: "#FCD34D",
      accent: "#F59E0B",
      success: "#65A30D",
      warning: "#FACC15",
      error: "#B91C1C",
    },
    icon: () => <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>,
  },
  arctic: {
    id: "arctic",
    name: "Arctic",
    description: "Cool arctic ice colors",
    colors: {
      primary: "#60A5FA",
      background: "#E0F2FE",
      secondary: "#BFDBFE",
      text: "#0C4A6E",
      textSecondary: "#0284C7",
      border: "#93C5FD",
      accent: "#3B82F6",
      success: "#22C55E",
      warning: "#FCD34D",
      error: "#DC2626",
    },
    icon: () => <div className="w-4 h-4 bg-blue-300 rounded-full"></div>,
  },
  blush: {
    id: "blush",
    name: "Blush",
    description: "Soft blush pink elegance",
    colors: {
      primary: "#EC4899",
      background: "#FFF0F6",
      secondary: "#FCE7F3",
      text: "#831843",
      textSecondary: "#DB2777",
      border: "#F9A8D4",
      accent: "#F472B6",
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F43F5E",
    },
    icon: () => <div className="w-4 h-4 bg-pink-400 rounded-full"></div>,
  },
  charcoal: {
    id: "charcoal",
    name: "Charcoal",
    description: "Deep charcoal darkness",
    colors: {
      primary: "#374151",
      background: "#111827",
      secondary: "#1F2937",
      text: "#F9FAFB",
      textSecondary: "#9CA3AF",
      border: "#4B5563",
      accent: "#6B7280",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-gray-600 rounded-full"></div>,
  },
  neon: {
    id: "neon",
    name: "Neon",
    description: "Bright neon electric colors",
    colors: {
      primary: "#39FF14",
      background: "#0D0D0D",
      secondary: "#1A1A1A",
      text: "#CCFFCC",
      textSecondary: "#00FFEA",
      border: "#39FF14",
      accent: "#00FFFF",
      success: "#00FF7F",
      warning: "#FFFF33",
      error: "#FF073A",
    },
    icon: () => <div className="w-4 h-4 bg-green-400 rounded-full"></div>,
  },
  storm: {
    id: "storm",
    name: "Storm",
    description: "Stormy blue-gray atmosphere",
    colors: {
      primary: "#3B82F6",
      background: "#1E293B",
      secondary: "#334155",
      text: "#E2E8F0",
      textSecondary: "#94A3B8",
      border: "#475569",
      accent: "#60A5FA",
      success: "#10B981",
      warning: "#FBBF24",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-blue-500 rounded-full"></div>,
  },  crystal: {
    id: "crystal",
    name: "Crystal",
    description: "Clear crystal blue clarity",
    colors: {
      primary: "#38BDF8",
      background: "#F0F9FF",
      secondary: "#E0F2FE",
      text: "#0C4A6E",
      textSecondary: "#0284C7",
      border: "#7DD3FC",
      accent: "#22D3EE",
      success: "#22C55E",
      warning: "#FACC15",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>,
  },
  flame: {
    id: "flame",
    name: "Flame",
    description: "Intense flame fire colors",
    colors: {
      primary: "#FF5722",
      background: "#2E0F0C",
      secondary: "#3B1E1E",
      text: "#FFE9E4",
      textSecondary: "#FFAB91",
      border: "#FF7043",
      accent: "#FF8A65",
      success: "#4CAF50",
      warning: "#FFC107",
      error: "#F44336",
    },
    icon: () => <div className="w-4 h-4 bg-red-500 rounded-full"></div>,
  },
  clay: {
    id: "clay",
    name: "Clay",
    description: "Earthy clay pottery tones",
    colors: {
      primary: "#B08968",
      background: "#F5F1ED",
      secondary: "#E6D3C6",
      text: "#4E342E",
      textSecondary: "#A1887F",
      border: "#D7CCC8",
      accent: "#A67B5B",
      success: "#81C784",
      warning: "#FFD54F",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-amber-800 rounded-full"></div>,
  },
  mint: {
    id: "mint",
    name: "Mint",
    description: "Fresh mint green coolness",
    colors: {
      primary: "#10B981",
      background: "#F0FFF4",
      secondary: "#D1FAE5",
      text: "#065F46",
      textSecondary: "#6EE7B7",
      border: "#34D399",
      accent: "#2DD4BF",
      success: "#16A34A",
      warning: "#FBBF24",
      error: "#DC2626",
    },
    icon: () => <div className="w-4 h-4 bg-green-500 rounded-full"></div>,
  },
  dusk: {
    id: "dusk",
    name: "Dusk",
    description: "Twilight dusk atmosphere",
    colors: {
      primary: "#7F1D1D",
      background: "#1C1C1C",
      secondary: "#2C2C2C",
      text: "#FDEDED",
      textSecondary: "#FCA5A5",
      border: "#991B1B",
      accent: "#E11D48",
      success: "#22C55E",
      warning: "#FACC15",
      error: "#DC2626",
    },
    icon: () => <div className="w-4 h-4 bg-red-800 rounded-full"></div>,
  },
  cloud: {
    id: "cloud",
    name: "Cloud",
    description: "Soft cloud white serenity",
    colors: {
      primary: "#A5B4FC",
      background: "#F8FAFC",
      secondary: "#E5E7EB",
      text: "#1E293B",
      textSecondary: "#94A3B8",
      border: "#CBD5E1",
      accent: "#818CF8",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-indigo-300 rounded-full"></div>,
  },
  firewatch: {
    id: "firewatch",
    name: "Firewatch",
    description: "Fire tower lookout theme",
    colors: {
      primary: "#EF6C00",
      background: "#0B0C10",
      secondary: "#1F1F1F",
      text: "#FFEDD5",
      textSecondary: "#F59E0B",
      border: "#EF6C00",
      accent: "#FF8F00",
      success: "#43A047",
      warning: "#FB8C00",
      error: "#E53935",
    },
    icon: () => <div className="w-4 h-4 bg-orange-500 rounded-full"></div>,
  },  onyx: {
    id: "onyx",
    name: "Onyx",
    description: "Deep black onyx stone",
    colors: {
      primary: "#FF914D",
      background: "#121212",
      secondary: "#1E1E1E",
      text: "#F5F5F5",
      textSecondary: "#A1A1AA",
      border: "#2C2C2C",
      accent: "#FFB26B",
      success: "#00E676",
      warning: "#FFC400",
      error: "#F44336",
    },
    icon: () => <div className="w-4 h-4 bg-gray-900 rounded-full"></div>,
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian",
    description: "Dark obsidian volcanic glass",
    colors: {
      primary: "#009688",
      background: "#0F0F0F",
      secondary: "#1C1C1C",
      text: "#ECECEC",
      textSecondary: "#A8A8A8",
      border: "#333333",
      accent: "#26A69A",
      success: "#00C853",
      warning: "#FFAB00",
      error: "#D50000",
    },
    icon: () => <div className="w-4 h-4 bg-teal-600 rounded-full"></div>,
  },
  void: {
    id: "void",
    name: "Void",
    description: "Empty void purple darkness",
    colors: {
      primary: "#673AB7",
      background: "#0A0A0A",
      secondary: "#1A1A1A",
      text: "#EDEDED",
      textSecondary: "#B39DDB",
      border: "#4527A0",
      accent: "#9575CD",
      success: "#00E676",
      warning: "#FFEB3B",
      error: "#E53935",
    },
    icon: () => <div className="w-4 h-4 bg-purple-600 rounded-full"></div>,
  },
  carbon: {
    id: "carbon",
    name: "Carbon",
    description: "Industrial carbon fiber",
    colors: {
      primary: "#607D8B",
      background: "#1C1C1C",
      secondary: "#263238",
      text: "#ECEFF1",
      textSecondary: "#90A4AE",
      border: "#37474F",
      accent: "#78909C",
      success: "#00C853",
      warning: "#FFB300",
      error: "#FF5252",
    },
    icon: () => <div className="w-4 h-4 bg-slate-600 rounded-full"></div>,
  },
  coal: {
    id: "coal",
    name: "Coal",
    description: "Dark coal mining depths",
    colors: {
      primary: "#FF8F00",
      background: "#141414",
      secondary: "#202020",
      text: "#FAFAFA",
      textSecondary: "#E0E0E0",
      border: "#2D2D2D",
      accent: "#FFA000",
      success: "#66BB6A",
      warning: "#FFCA28",
      error: "#E53935",
    },
    icon: () => <div className="w-4 h-4 bg-gray-800 rounded-full"></div>,
  },
  nightshade: {
    id: "nightshade",
    name: "Nightshade",
    description: "Mystical purple nightshade",
    colors: {
      primary: "#D946EF",
      background: "#1A132F",
      secondary: "#2E1A47",
      text: "#EDE9FE",
      textSecondary: "#C084FC",
      border: "#7C3AED",
      accent: "#A855F7",
      success: "#34D399",
      warning: "#FACC15",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-purple-500 rounded-full"></div>,
  },
  deepsea: {
    id: "deepsea",
    name: "Deep Sea",
    description: "Ocean depths exploration",
    colors: {
      primary: "#1E90FF",
      background: "#0C1B33",
      secondary: "#132742",
      text: "#DCEFFF",
      textSecondary: "#7FB3FF",
      border: "#2B3A67",
      accent: "#4682B4",
      success: "#00FA9A",
      warning: "#FFD700",
      error: "#DC143C",
    },
    icon: () => <div className="w-4 h-4 bg-blue-700 rounded-full"></div>,
  },
  rustic: {
    id: "rustic",
    name: "Rustic",
    description: "Rustic countryside charm",
    colors: {
      primary: "#C1440E",
      background: "#2D1E1B",
      secondary: "#3F2D2B",
      text: "#FFF4E6",
      textSecondary: "#E0A899",
      border: "#B55439",
      accent: "#E07A5F",
      success: "#43AA8B",
      warning: "#FFD166",
      error: "#E63946",
    },
    icon: () => <div className="w-4 h-4 bg-red-700 rounded-full"></div>,
  },
  ash: {
    id: "ash",
    name: "Ash",
    description: "Volcanic ash gray tones",
    colors: {
      primary: "#9E9E9E",
      background: "#1E1E1E",
      secondary: "#2B2B2B",
      text: "#FAFAFA",
      textSecondary: "#BDBDBD",
      border: "#424242",
      accent: "#757575",
      success: "#81C784",
      warning: "#FFF176",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-gray-500 rounded-full"></div>,
  },
  plasma: {
    id: "plasma",
    name: "Plasma",
    description: "Electric plasma energy",
    colors: {
      primary: "#FF00C3",
      background: "#121212",
      secondary: "#1E1E1E",
      text: "#F2F2F2",
      textSecondary: "#FF79C6",
      border: "#8A2BE2",
      accent: "#DA70D6",
      success: "#50FA7B",
      warning: "#F1FA8C",
      error: "#FF5555",
    },
    icon: () => <div className="w-4 h-4 bg-fuchsia-400 rounded-full"></div>,
  },
  abyss: {
    id: "abyss",
    name: "Abyss",
    description: "Deep ocean abyss depths",
    colors: {
      primary: "#00CED1",
      background: "#06080A",
      secondary: "#102128",
      text: "#C0E0E6",
      textSecondary: "#76C6D6",
      border: "#2B4F60",
      accent: "#20B2AA",
      success: "#3CB371",
      warning: "#FFB347",
      error: "#FF4500",
    },
    icon: () => <div className="w-4 h-4 bg-cyan-600 rounded-full"></div>,
  },
  obsidianNight: {
    id: "obsidianNight",
    name: "Obsidian Night",
    description: "Obsidian stone in midnight",
    colors: {
      primary: "#FF6F91",
      background: "#101014",
      secondary: "#1E1E23",
      text: "#FAFAFA",
      textSecondary: "#D4A5A5",
      border: "#37373D",
      accent: "#F06292",
      success: "#4CAF50",
      warning: "#FFC107",
      error: "#F44336",
    },
    icon: () => <div className="w-4 h-4 bg-pink-500 rounded-full"></div>,
  },
  pearlBlack: {
    id: "pearlBlack",
    name: "Pearl Black",
    description: "Elegant pearl black luxury",
    colors: {
      primary: "#D9A5B3",
      background: "#0B0C10",
      secondary: "#151720",
      text: "#EEECEA",
      textSecondary: "#E0BAC1",
      border: "#2C2F38",
      accent: "#F4AAB9",
      success: "#8BC34A",
      warning: "#FFEB3B",
      error: "#E53935",
    },
    icon: () => <div className="w-4 h-4 bg-rose-300 rounded-full"></div>,
  },
  pitch: {
    id: "pitch",
    name: "Pitch",
    description: "Pitch black darkness",
    colors: {
      primary: "#8B5CF6",
      background: "#000000",
      secondary: "#0F0F0F",
      text: "#F8FAFC",
      textSecondary: "#C4B5FD",
      border: "#4C1D95",
      accent: "#A78BFA",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#DC2626",
    },
    icon: () => <div className="w-4 h-4 bg-violet-600 rounded-full"></div>,
  },
  phantom: {
    id: "phantom",
    name: "Phantom",
    description: "Ghostly phantom purple",
    colors: {
      primary: "#7F00FF",
      background: "#0D0F1C",
      secondary: "#191933",
      text: "#EDE7F6",
      textSecondary: "#B39DDB",
      border: "#512DA8",
      accent: "#9575CD",
      success: "#00E676",
      warning: "#FFD600",
      error: "#F44336",
    },
    icon: () => <div className="w-4 h-4 bg-purple-700 rounded-full"></div>,
  },  coral: {
    id: "coral",
    name: "Coral",
    description: "Ocean coral reef colors",
    colors: {
      primary: "#FF7F50",
      background: "#FFF8F5",
      secondary: "#FFEDE5",
      text: "#5A1F00",
      textSecondary: "#FF9E80",
      border: "#FFD2C1",
      accent: "#FFA07A",
      success: "#4CAF50",
      warning: "#FFD700",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-orange-400 rounded-full"></div>,
  },
  linen: {
    id: "linen",
    name: "Linen",
    description: "Natural linen fabric texture",
    colors: {
      primary: "#A67B5B",
      background: "#FAF0E6",
      secondary: "#F5EDE6",
      text: "#5C4033",
      textSecondary: "#A1887F",
      border: "#D7CCC8",
      accent: "#BCAAA4",
      success: "#81C784",
      warning: "#FFD54F",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-stone-400 rounded-full"></div>,
  },
  peach: {
    id: "peach",
    name: "Peach",
    description: "Sweet peach fruit softness",
    colors: {
      primary: "#FFAB91",
      background: "#FFF5F0",
      secondary: "#FFE0D4",
      text: "#5D1200",
      textSecondary: "#FF7043",
      border: "#FFCCBC",
      accent: "#FF8A65",
      success: "#81C784",
      warning: "#FFCA28",
      error: "#F44336",
    },
    icon: () => <div className="w-4 h-4 bg-orange-300 rounded-full"></div>,
  },
  ivory: {
    id: "ivory",
    name: "Ivory",
    description: "Elegant ivory cream colors",
    colors: {
      primary: "#C5A880",
      background: "#FFFFF0",
      secondary: "#FDF6E3",
      text: "#4E342E",
      textSecondary: "#8D6E63",
      border: "#D7CCC8",
      accent: "#FFDAB9",
      success: "#66BB6A",
      warning: "#FFC107",
      error: "#EF5350",
    },
    icon: () => <div className="w-4 h-4 bg-yellow-200 rounded-full"></div>,
  },
  skyline: {
    id: "skyline",
    name: "Skyline",
    description: "City skyline horizon view",
    colors: {
      primary: "#0EA5E9",
      background: "#F0F9FF",
      secondary: "#E0F2FE",
      text: "#0F172A",
      textSecondary: "#0284C7",
      border: "#7DD3FC",
      accent: "#38BDF8",
      success: "#22C55E",
      warning: "#FBBF24",
      error: "#EF4444",
    },
    icon: () => <div className="w-4 h-4 bg-sky-500 rounded-full"></div>,
  },
  almond: {
    id: "almond",
    name: "Almond",
    description: "Warm almond nut tones",
    colors: {
      primary: "#EFBC9B",
      background: "#FFF9F5",
      secondary: "#FFE4D6",
      text: "#5C2E0A",
      textSecondary: "#FFAB91",
      border: "#FFD2BA",
      accent: "#FFB27E",
      success: "#81C784",
      warning: "#FFD54F",
      error: "#E57373",
    },
    icon: () => <div className="w-4 h-4 bg-amber-400 rounded-full"></div>,
  },

};