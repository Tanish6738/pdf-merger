"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Eye,
  Type,
  Contrast,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  Accessibility,
  Settings,
  RotateCcw,
  Check,
  X,
  PenTool,
} from "lucide-react";
import CustomThemeCreator from "./CustomThemeCreator";

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Predefined themes
const themes = {
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
  },
  mocha: {
    name: "Mocha",
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

  rose: {
    name: "Rose",
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

  cyberpunk: {
    name: "Cyberpunk",
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
  midnight: {
    name: "Midnight",
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

  latte: {
    name: "Latte",
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

  forest: {
    name: "Forest",
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

  sky: {
    name: "Sky",
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

  vintage: {
    name: "Vintage",
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

  ember: {
    name: "Ember",
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

  grape: {
    name: "Grape",
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

  silver: {
    name: "Silver",
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

  desert: {
    name: "Desert",
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

  arctic: {
    name: "Arctic",
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

  blush: {
    name: "Blush",
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

  charcoal: {
    name: "Charcoal",
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

  neon: {
    name: "Neon",
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

  storm: {
    name: "Storm",
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
  crystal: {
    name: "Crystal",
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

  flame: {
    name: "Flame",
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

  clay: {
    name: "Clay",
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

  mint: {
    name: "Mint",
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

  dusk: {
    name: "Dusk",
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

  cloud: {
    name: "Cloud",
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

  firewatch: {
    name: "Firewatch",
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
  onyx: {
    name: "Onyx",
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

  obsidian: {
    name: "Obsidian",
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

  void: {
    name: "Void",
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

  carbon: {
    name: "Carbon",
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

  coal: {
    name: "Coal",
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

  nightshade: {
    name: "Nightshade",
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

  deepsea: {
    name: "Deep Sea",
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

  rustic: {
    name: "Rustic",
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

  ash: {
    name: "Ash",
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

  plasma: {
    name: "Plasma",
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

  abyss: {
    name: "Abyss",
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

  obsidianNight: {
    name: "Obsidian Night",
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

  pearlBlack: {
    name: "Pearl Black",
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

  pitch: {
    name: "Pitch",
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

  phantom: {
    name: "Phantom",
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
  coral: {
    name: "Coral",
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

  linen: {
    name: "Linen",
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

  peach: {
    name: "Peach",
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

  ivory: {
    name: "Ivory",
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

  skyline: {
    name: "Skyline",
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

  almond: {
    name: "Almond",
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

  vanilla: {
    name: "Vanilla",
    primary: "#F3E5AB",
    background: "#FFFDF2",
    secondary: "#FFF8DC",
    text: "#5A3E00",
    textSecondary: "#D4AF37",
    border: "#FCEBB4",
    accent: "#FFE082",
    success: "#8BC34A",
    warning: "#FFC107",
    error: "#F44336",
  },

  seashell: {
    name: "Seashell",
    primary: "#87CEEB",
    background: "#FDF5E6",
    secondary: "#F5F5DC",
    text: "#005B63",
    textSecondary: "#40E0D0",
    border: "#B0E0E6",
    accent: "#ADD8E6",
    success: "#00C896",
    warning: "#FFC107",
    error: "#FF4500",
  },

  orchid: {
    name: "Orchid",
    primary: "#DA70D6",
    background: "#FFF0F5",
    secondary: "#F8E1FF",
    text: "#6A1B9A",
    textSecondary: "#BA68C8",
    border: "#CE93D8",
    accent: "#AB47BC",
    success: "#66BB6A",
    warning: "#FFEB3B",
    error: "#E91E63",
  },

  melon: {
    name: "Melon",
    primary: "#FF6F61",
    background: "#FFF7F3",
    secondary: "#FFE4E1",
    text: "#4B1C1C",
    textSecondary: "#FF8A80",
    border: "#FFABAB",
    accent: "#FFB3A7",
    success: "#81C784",
    warning: "#FFD54F",
    error: "#F44336",
  },

  champagne: {
    name: "Champagne",
    primary: "#F7E7CE",
    background: "#FFFDF4",
    secondary: "#F3E5AB",
    text: "#6B4226",
    textSecondary: "#D2B48C",
    border: "#E6D3A9",
    accent: "#FFDDC1",
    success: "#AED581",
    warning: "#FFEB3B",
    error: "#EF5350",
  },

  aqua: {
    name: "Aqua",
    primary: "#00FFFF",
    background: "#E0FFFF",
    secondary: "#B2FFFF",
    text: "#003C3C",
    textSecondary: "#40E0D0",
    border: "#AFEEEE",
    accent: "#00CED1",
    success: "#3CB371",
    warning: "#FFD700",
    error: "#F08080",
  },

  sand: {
    name: "Sand",
    primary: "#EDC9AF",
    background: "#FFF8E1",
    secondary: "#FAEBD7",
    text: "#5C4033",
    textSecondary: "#A67B5B",
    border: "#EED9C4",
    accent: "#F4A460",
    success: "#8BC34A",
    warning: "#FFEB3B",
    error: "#E57373",
  },

  periwinkle: {
    name: "Periwinkle",
    primary: "#CCCCFF",
    background: "#F5F5FF",
    secondary: "#E6E6FA",
    text: "#4B0082",
    textSecondary: "#9370DB",
    border: "#D8BFD8",
    accent: "#B0C4DE",
    success: "#00FA9A",
    warning: "#FFEB3B",
    error: "#F44336",
  },

  mintcream: {
    name: "Mint Cream",
    primary: "#AAF0D1",
    background: "#F5FFFA",
    secondary: "#E0FFF9",
    text: "#004D40",
    textSecondary: "#00C896",
    border: "#CCFFEB",
    accent: "#2DD4BF",
    success: "#16A34A",
    warning: "#FCD34D",
    error: "#DC2626",
  },

  ice: {
    name: "Ice",
    primary: "#A0E9FD",
    background: "#E0F7FA",
    secondary: "#CCFBF1",
    text: "#0F172A",
    textSecondary: "#7DD3FC",
    border: "#67E8F9",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#FBBF24",
    error: "#F43F5E",
  },

  berry: {
    name: "Berry",
    primary: "#BE185D",
    background: "#1E1B29",
    secondary: "#3F2C44",
    text: "#FCE7F3",
    textSecondary: "#F472B6",
    border: "#E11D48",
    accent: "#EC4899",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F43F5E",
  },

  brass: {
    name: "Brass",
    primary: "#B8860B",
    background: "#1C1A14",
    secondary: "#292516",
    text: "#F5F5DC",
    textSecondary: "#E0C36F",
    border: "#DAA520",
    accent: "#FFD700",
    success: "#9ACD32",
    warning: "#FFD700",
    error: "#B22222",
  },

  softpink: {
    name: "Soft Pink",
    primary: "#FFB6C1",
    background: "#FFF0F5",
    secondary: "#FFE4E1",
    text: "#6B0212",
    textSecondary: "#EC4899",
    border: "#F9A8D4",
    accent: "#F472B6",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F43F5E",
  },

  raven: {
    name: "Raven",
    primary: "#6B7280",
    background: "#111827",
    secondary: "#1F2937",
    text: "#E5E7EB",
    textSecondary: "#9CA3AF",
    border: "#4B5563",
    accent: "#9CA3AF",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  lavender: {
    name: "Lavender",
    primary: "#B4A0E5",
    background: "#F5F3FF",
    secondary: "#EDE9FE",
    text: "#4B0082",
    textSecondary: "#8B5CF6",
    border: "#C4B5FD",
    accent: "#A78BFA",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#DC2626",
  },

  steel: {
    name: "Steel",
    primary: "#607D8B",
    background: "#ECEFF1",
    secondary: "#CFD8DC",
    text: "#263238",
    textSecondary: "#607D8B",
    border: "#B0BEC5",
    accent: "#90A4AE",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
  },

  lemon: {
    name: "Lemon",
    primary: "#FCD34D",
    background: "#FFFBEB",
    secondary: "#FEF3C7",
    text: "#92400E",
    textSecondary: "#CA8A04",
    border: "#FBBF24",
    accent: "#FDE68A",
    success: "#65A30D",
    warning: "#FACC15",
    error: "#B91C1C",
  },

  noir: {
    name: "Noir",
    primary: "#FFFFFF",
    background: "#000000",
    secondary: "#121212",
    text: "#E5E5E5",
    textSecondary: "#A1A1AA",
    border: "#27272A",
    accent: "#71717A",
    success: "#22C55E",
    warning: "#EAB308",
    error: "#EF4444",
  },

  turquoise: {
    name: "Turquoise",
    primary: "#14B8A6",
    background: "#E0F2F1",
    secondary: "#B2DFDB",
    text: "#004D40",
    textSecondary: "#26A69A",
    border: "#80CBC4",
    accent: "#2DD4BF",
    success: "#10B981",
    warning: "#FBBF24",
    error: "#EF4444",
  },

  canyon: {
    name: "Canyon",
    primary: "#D97706",
    background: "#FFF7ED",
    secondary: "#FFECD5",
    text: "#78350F",
    textSecondary: "#B45309",
    border: "#FDBA74",
    accent: "#F97316",
    success: "#84CC16",
    warning: "#FACC15",
    error: "#DC2626",
  },

  pearl: {
    name: "Pearl",
    primary: "#F9FAFB",
    background: "#FFFFFF",
    secondary: "#F3F4F6",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    accent: "#E0E7FF",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  eclipse: {
    name: "Eclipse",
    primary: "#4F46E5",
    background: "#0F172A",
    secondary: "#1E293B",
    text: "#E0E7FF",
    textSecondary: "#A5B4FC",
    border: "#3730A3",
    accent: "#6366F1",
    success: "#22C55E",
    warning: "#FACC15",
    error: "#EF4444",
  },
  sunset: {
    name: "Sunset",
    primary: "#FB923C",
    background: "#FFF7ED",
    secondary: "#FFEDD5",
    text: "#7C2D12",
    textSecondary: "#FDBA74",
    border: "#FDBA74",
    accent: "#F97316",
    success: "#22C55E",
    warning: "#EAB308",
    error: "#DC2626",
  },

  ocean: {
    name: "Ocean",
    primary: "#0EA5E9",
    background: "#E0F7FA",
    secondary: "#B2EBF2",
    text: "#0C4A6E",
    textSecondary: "#0284C7",
    border: "#7DD3FC",
    accent: "#22D3EE",
    success: "#10B981",
    warning: "#FBBF24",
    error: "#EF4444",
  },

  blush: {
    name: "Blush",
    primary: "#F472B6",
    background: "#FFF1F2",
    secondary: "#FCE7F3",
    text: "#831843",
    textSecondary: "#E879F9",
    border: "#F9A8D4",
    accent: "#EC4899",
    success: "#10B981",
    warning: "#FBBF24",
    error: "#EF4444",
  },

  twilight: {
    name: "Twilight",
    primary: "#6366F1",
    background: "#1E1B4B",
    secondary: "#312E81",
    text: "#E0E7FF",
    textSecondary: "#A5B4FC",
    border: "#4F46E5",
    accent: "#8B5CF6",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  carbon: {
    name: "Carbon",
    primary: "#6B7280",
    background: "#111827",
    secondary: "#1F2937",
    text: "#E5E7EB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    accent: "#9CA3AF",
    success: "#10B981",
    warning: "#EAB308",
    error: "#EF4444",
  },

  sand: {
    name: "Sand",
    primary: "#F4A261",
    background: "#FFF5E1",
    secondary: "#FFE5B4",
    text: "#7C3A00",
    textSecondary: "#FDBA74",
    border: "#FFEDD5",
    accent: "#F97316",
    success: "#84CC16",
    warning: "#FBBF24",
    error: "#EF4444",
  },

  emerald: {
    name: "Emerald",
    primary: "#34D399",
    background: "#D1FAE5",
    secondary: "#A7F3D0",
    text: "#064E3B",
    textSecondary: "#10B981",
    border: "#6EE7B7",
    accent: "#059669",
    success: "#16A34A",
    warning: "#FACC15",
    error: "#DC2626",
  },

  grayscale: {
    name: "Grayscale",
    primary: "#9CA3AF",
    background: "#F9FAFB",
    secondary: "#E5E7EB",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#D1D5DB",
    accent: "#A1A1AA",
    success: "#22C55E",
    warning: "#FBBF24",
    error: "#EF4444",
  },

  gold: {
    name: "Gold",
    primary: "#FFD700",
    background: "#FFF9DB",
    secondary: "#FAF089",
    text: "#92400E",
    textSecondary: "#D97706",
    border: "#FCD34D",
    accent: "#FBBF24",
    success: "#65A30D",
    warning: "#FACC15",
    error: "#DC2626",
  },

  iceberg: {
    name: "Iceberg",
    primary: "#7DD3FC",
    background: "#F0F9FF",
    secondary: "#E0F2FE",
    text: "#0C4A6E",
    textSecondary: "#38BDF8",
    border: "#BAE6FD",
    accent: "#0EA5E9",
    success: "#10B981",
    warning: "#FBBF24",
    error: "#F43F5E",
  },

  rose: {
    name: "Rose",
    primary: "#F43F5E",
    background: "#FFF1F2",
    secondary: "#FFE4E6",
    text: "#881337",
    textSecondary: "#F472B6",
    border: "#FBCFE8",
    accent: "#E11D48",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#EF4444",
  },

  cobalt: {
    name: "Cobalt",
    primary: "#2563EB",
    background: "#EFF6FF",
    secondary: "#DBEAFE",
    text: "#1E3A8A",
    textSecondary: "#60A5FA",
    border: "#93C5FD",
    accent: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  pine: {
    name: "Pine",
    primary: "#065F46",
    background: "#F0FDF4",
    secondary: "#D1FAE5",
    text: "#064E3B",
    textSecondary: "#34D399",
    border: "#A7F3D0",
    accent: "#059669",
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  orchid: {
    name: "Orchid",
    primary: "#C084FC",
    background: "#FAF5FF",
    secondary: "#E9D5FF",
    text: "#6B21A8",
    textSecondary: "#C4B5FD",
    border: "#D8B4FE",
    accent: "#A855F7",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  ink: {
    name: "Ink",
    primary: "#1E40AF",
    background: "#0F172A",
    secondary: "#1E293B",
    text: "#CBD5E1",
    textSecondary: "#94A3B8",
    border: "#334155",
    accent: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  pearlGray: {
    name: "Pearl Gray",
    primary: "#E5E7EB",
    background: "#F9FAFB",
    secondary: "#E5E7EB",
    text: "#1F2937",
    textSecondary: "#9CA3AF",
    border: "#D1D5DB",
    accent: "#D4D4D8",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  tangerine: {
    name: "Tangerine",
    primary: "#FB923C",
    background: "#FFF7ED",
    secondary: "#FFE5B4",
    text: "#7C2D12",
    textSecondary: "#FDBA74",
    border: "#FDBA74",
    accent: "#F97316",
    success: "#22C55E",
    warning: "#EAB308",
    error: "#DC2626",
  },

  plum: {
    name: "Plum",
    primary: "#9333EA",
    background: "#F3E8FF",
    secondary: "#E9D5FF",
    text: "#4C1D95",
    textSecondary: "#C084FC",
    border: "#C4B5FD",
    accent: "#A855F7",
    success: "#22C55E",
    warning: "#FACC15",
    error: "#EF4444",
  },

  navy: {
    name: "Navy",
    primary: "#1D4ED8",
    background: "#E0E7FF",
    secondary: "#C7D2FE",
    text: "#1E3A8A",
    textSecondary: "#3B82F6",
    border: "#93C5FD",
    accent: "#2563EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  storm: {
    name: "Storm",
    primary: "#64748B",
    background: "#F1F5F9",
    secondary: "#E2E8F0",
    text: "#0F172A",
    textSecondary: "#475569",
    border: "#CBD5E1",
    accent: "#94A3B8",
    success: "#22C55E",
    warning: "#FACC15",
    error: "#EF4444",
  },
  cocoa: {
    name: "Cocoa",
    primary: "#6F4E37",
    background: "#3E2C29",
    secondary: "#4B3621",
    text: "#EFE2D0",
    textSecondary: "#D7CCC8",
    border: "#A1887F",
    accent: "#8B5E3C",
    success: "#81C784",
    warning: "#FFB74D",
    error: "#E57373",
  },
};

// Accessibility options
const accessibilityOptions = {
  fontSize: {
    small: { size: "14px", name: "Small" },
    medium: { size: "16px", name: "Medium" },
    large: { size: "18px", name: "Large" },
    extraLarge: { size: "20px", name: "Extra Large" },
  },
  contrast: {
    normal: { name: "Normal", filter: "none" },
    high: { name: "High", filter: "contrast(1.5)" },
    extraHigh: { name: "Extra High", filter: "contrast(2)" },
  },
  motion: {
    full: { name: "Full Motion", enabled: true },
    reduced: { name: "Reduced Motion", enabled: false },
  },
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [accessibility, setAccessibility] = useState({
    fontSize: "medium",
    contrast: "normal",
    reduceMotion: false,
    soundEnabled: true,
    highContrastMode: false,
    focusIndicators: true,
    keyboardNavigation: true,
  });

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("pdf-merger-theme") || "dark";
      const savedAccessibility = localStorage.getItem(
        "pdf-merger-accessibility"
      );

      setCurrentTheme(savedTheme);

      if (savedAccessibility) {
        try {
          setAccessibility(JSON.parse(savedAccessibility));
        } catch (error) {
          console.error("Failed to parse accessibility settings:", error);
        }
      }
    }
  }, []);
  // Apply theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      let themeColors;

      // Check if this is a custom theme
      if (currentTheme.startsWith("custom-")) {
        const customThemes = JSON.parse(
          localStorage.getItem("pdf-merger-custom-themes") || "[]"
        );
        const customTheme = customThemes.find(
          (theme) => theme.id === currentTheme
        );

        if (customTheme) {
          themeColors = customTheme.colors;
        } else {
          // Fallback to default theme if custom theme not found
          themeColors = themes["dark"].colors;
        }
      } else {
        // Use predefined theme
        const theme = themes[currentTheme];
        themeColors = theme?.colors;
      }

      const root = document.documentElement;

      if (themeColors) {
        Object.entries(themeColors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value);
        });
      }

      // Apply accessibility settings
      root.style.setProperty(
        "--font-size-base",
        accessibilityOptions.fontSize[accessibility.fontSize].size
      );
      root.style.setProperty(
        "--contrast-filter",
        accessibilityOptions.contrast[accessibility.contrast].filter
      );

      if (accessibility.reduceMotion) {
        root.style.setProperty("--motion-duration", "0s");
      } else {
        root.style.setProperty("--motion-duration", "0.3s");
      }

      // Save to localStorage
      localStorage.setItem("pdf-merger-theme", currentTheme);
      localStorage.setItem(
        "pdf-merger-accessibility",
        JSON.stringify(accessibility)
      );
    }
  }, [currentTheme, accessibility]);

  const updateTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  const updateAccessibility = (setting, value) => {
    setAccessibility((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const resetSettings = () => {
    setCurrentTheme("dark");
    setAccessibility({
      fontSize: "medium",
      contrast: "normal",
      reduceMotion: false,
      soundEnabled: true,
      highContrastMode: false,
      focusIndicators: true,
      keyboardNavigation: true,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        accessibility,
        updateTheme,
        updateAccessibility,
        resetSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Theme and Accessibility Settings Component
const ThemeAccessibilitySettings = ({ isOpen, onClose, onNavigate }) => {
  const {
    currentTheme,
    themes,
    accessibility,
    updateTheme,
    updateAccessibility,
    resetSettings,
  } = useTheme();
  const [activeTab, setActiveTab] = useState("themes");
  const tabs = [
    { id: "themes", name: "Themes", icon: Palette },
    { id: "custom", name: "Custom", icon: PenTool },
    { id: "accessibility", name: "Accessibility", icon: Accessibility },
    { id: "display", name: "Display", icon: Eye },
  ];

  // Handle back navigation for full-page mode
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    } else if (onClose) {
      onClose();
    }
  };

  // Full page component (when used with onNavigate)
  const FullPageContent = () => (
    <div className="min-h-screen bg-[var(--color-background,#1B212C)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-[var(--color-primary,#00A99D)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text,#E1E6EB)]">
              Appearance & Accessibility
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-[var(--color-textSecondary,#A0AEC0)] hover:text-[var(--color-text,#E1E6EB)] transition-colors text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-[var(--color-primary,#00A99D)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[var(--color-secondary,#151B24)] rounded-2xl border border-[var(--color-border,#A0AEC0)]/20 overflow-hidden">
          <div className="flex border-b border-[var(--color-border,#A0AEC0)]/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-[var(--color-primary,#00A99D)] bg-[var(--color-primary,#00A99D)]/10"
                      : "text-[var(--color-textSecondary,#A0AEC0)] hover:text-[var(--color-text,#E1E6EB)] hover:bg-[var(--color-secondary,#151B24)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary,#00A99D)]"
                      layoutId="activeTabFullPage"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6">
            <TabContent activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );

  // Modal component (when used with isOpen/onClose)
  const ModalContent = () => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--color-background,#1B212C)] rounded-2xl border border-[var(--color-border,#A0AEC0)]/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border,#A0AEC0)]/20">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-[var(--color-primary,#00A99D)]" />
                <h2 className="text-2xl font-bold text-[var(--color-text,#E1E6EB)]">
                  Appearance & Accessibility
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetSettings}
                  className="px-3 py-2 text-[var(--color-textSecondary,#A0AEC0)] hover:text-[var(--color-text,#E1E6EB)] transition-colors text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--color-textSecondary,#A0AEC0)] hover:text-[var(--color-text,#E1E6EB)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-[var(--color-border,#A0AEC0)]/20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? "text-[var(--color-primary,#00A99D)] bg-[var(--color-primary,#00A99D)]/10"
                        : "text-[var(--color-textSecondary,#A0AEC0)] hover:text-[var(--color-text,#E1E6EB)] hover:bg-[var(--color-secondary,#151B24)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary,#00A99D)]"
                        layoutId="activeTabModal"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <TabContent activeTab={activeTab} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Return appropriate component based on props
  if (onNavigate) {
    return <FullPageContent />;
  } else {
    return <ModalContent />;
  }
};

// Tab content component to avoid duplication
const TabContent = ({ activeTab }) => {
  const {
    currentTheme,
    themes,
    accessibility,
    updateTheme,
    updateAccessibility,
  } = useTheme();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {" "}
        {/* Themes Tab */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)] mb-4">
                Choose Theme
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(themes).map((theme) => {
                  const Icon = theme.icon;
                  const isSelected = currentTheme === theme.id;

                  return (
                    <motion.button
                      key={theme.id}
                      onClick={() => updateTheme(theme.id)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[var(--color-primary,#00A99D)] bg-[var(--color-primary,#00A99D)]/10"
                          : "border-[var(--color-border,#A0AEC0)]/20 hover:border-[var(--color-primary,#00A99D)]/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute top-2 right-2 w-6 h-6 bg-[var(--color-primary,#00A99D)] rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}

                      <div className="flex items-center gap-3 mb-2">
                        {typeof Icon === "function" ? (
                          <Icon />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                        <h4 className="font-semibold text-[var(--color-text,#E1E6EB)]">
                          {theme.name}
                        </h4>
                      </div>
                      <p className="text-[var(--color-textSecondary,#A0AEC0)] text-sm">
                        {theme.description}
                      </p>

                      {/* Theme Preview */}
                      {theme.colors && (
                        <div className="flex gap-1 mt-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.background }}
                          ></div>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          ></div>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.accent }}
                          ></div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>{" "}
          </div>
        )}
        {/* Custom Theme Creator Tab */}
        {activeTab === "custom" && <CustomThemeCreator />}
        {/* Accessibility Tab */}
        {activeTab === "accessibility" && (
          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)] mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Font Size
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(accessibilityOptions.fontSize).map(
                  ([key, option]) => (
                    <button
                      key={key}
                      onClick={() => updateAccessibility("fontSize", key)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        accessibility.fontSize === key
                          ? "border-[var(--color-primary,#00A99D)] bg-[var(--color-primary,#00A99D)]/10 text-[var(--color-primary,#00A99D)]"
                          : "border-[var(--color-border,#A0AEC0)]/20 text-[var(--color-textSecondary,#A0AEC0)] hover:border-[var(--color-primary,#00A99D)]/50"
                      }`}
                    >
                      <div style={{ fontSize: option.size }}>Aa</div>
                      <div className="text-xs mt-1">{option.name}</div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Contrast */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)] mb-4 flex items-center gap-2">
                <Contrast className="w-5 h-5" />
                Contrast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(accessibilityOptions.contrast).map(
                  ([key, option]) => (
                    <button
                      key={key}
                      onClick={() => updateAccessibility("contrast", key)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        accessibility.contrast === key
                          ? "border-[var(--color-primary,#00A99D)] bg-[var(--color-primary,#00A99D)]/10 text-[var(--color-primary,#00A99D)]"
                          : "border-[var(--color-border,#A0AEC0)]/20 text-[var(--color-textSecondary,#A0AEC0)] hover:border-[var(--color-primary,#00A99D)]/50"
                      }`}
                    >
                      <div className="font-medium">{option.name}</div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)] flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                Accessibility Options
              </h3>

              {[
                {
                  key: "reduceMotion",
                  label: "Reduce Motion",
                  description: "Minimize animations and transitions",
                  icon: MousePointer,
                },
                {
                  key: "soundEnabled",
                  label: "Sound Effects",
                  description: "Enable audio feedback",
                  icon: Volume2,
                },
                {
                  key: "highContrastMode",
                  label: "High Contrast Mode",
                  description: "Enhanced visual contrast",
                  icon: Contrast,
                },
                {
                  key: "focusIndicators",
                  label: "Focus Indicators",
                  description: "Enhanced keyboard navigation",
                  icon: Keyboard,
                },
                {
                  key: "keyboardNavigation",
                  label: "Keyboard Navigation",
                  description: "Full keyboard support",
                  icon: Keyboard,
                },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.key}
                    className="flex items-center justify-between p-4 bg-[var(--color-secondary,#151B24)] rounded-lg border border-[var(--color-border,#A0AEC0)]/20"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[var(--color-primary,#00A99D)]" />
                      <div>
                        <h4 className="font-medium text-[var(--color-text,#E1E6EB)]">
                          {option.label}
                        </h4>
                        <p className="text-[var(--color-textSecondary,#A0AEC0)] text-sm">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accessibility[option.key]}
                        onChange={(e) =>
                          updateAccessibility(option.key, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--color-border,#A0AEC0)]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary,#00A99D)]"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Display Tab */}
        {activeTab === "display" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Display Settings
              </h3>

              <div className="bg-[var(--color-secondary,#151B24)] rounded-xl border border-[var(--color-border,#A0AEC0)]/20 p-6">
                <h4 className="font-semibold text-[var(--color-text,#E1E6EB)] mb-4">
                  Preview
                </h4>
                <div className="bg-[var(--color-background,#1B212C)] rounded-lg border border-[var(--color-border,#A0AEC0)]/20 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[var(--color-primary,#00A99D)] rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium text-[var(--color-text,#E1E6EB)]">
                        Sample Component
                      </h5>
                      <p className="text-[var(--color-textSecondary,#A0AEC0)] text-sm">
                        This shows how your settings look
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[var(--color-primary,#00A99D)] text-white rounded-lg hover:opacity-90 transition-opacity">
                    Sample Button
                  </button>
                </div>
              </div>
            </div>

            {/* Color Blind Support */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)] mb-4">
                Color Blind Support
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--color-secondary,#151B24)] rounded-lg border border-[var(--color-border,#A0AEC0)]/20 p-4">
                  <h4 className="font-medium text-[var(--color-text,#E1E6EB)] mb-2">
                    Protanopia Simulation
                  </h4>
                  <p className="text-[var(--color-textSecondary,#A0AEC0)] text-sm">
                    Red-green color blindness support
                  </p>
                </div>
                <div className="bg-[var(--color-secondary,#151B24)] rounded-lg border border-[var(--color-border,#A0AEC0)]/20 p-4">
                  <h4 className="font-medium text-[var(--color-text,#E1E6EB)] mb-2">
                    Deuteranopia Simulation
                  </h4>
                  <p className="text-[var(--color-textSecondary,#A0AEC0)] text-sm">
                    Red-green color blindness support
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Wrapped component that includes ThemeProvider
const ThemeAccessibilitySettingsWithProvider = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  return (
    <ThemeProvider>
      <ThemeAccessibilitySettings
        isOpen={isOpen}
        onClose={onClose}
        onNavigate={onNavigate}
      />
    </ThemeProvider>
  );
};

// Export individual components for flexibility (ThemeProvider already exported above)
export { ThemeAccessibilitySettings };

export default ThemeAccessibilitySettingsWithProvider;
