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
} from "lucide-react";

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
      const theme = themes[currentTheme];
      const root = document.documentElement;

      if (theme && theme.colors) {
        Object.entries(theme.colors).forEach(([key, value]) => {
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
            </div>
          </div>
        )}

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
const ThemeAccessibilitySettingsWithProvider = ({ isOpen, onClose, onNavigate }) => {
  return (
    <ThemeProvider>
      <ThemeAccessibilitySettings isOpen={isOpen} onClose={onClose} onNavigate={onNavigate} />
    </ThemeProvider>
  );
};

// Export individual components for flexibility (ThemeProvider already exported above)
export { ThemeAccessibilitySettings };

export default ThemeAccessibilitySettingsWithProvider;
