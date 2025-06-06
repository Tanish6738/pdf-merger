"use client";
import { useEffect } from 'react';

const ThemeInitializer = () => {
  useEffect(() => {
    // Apply theme immediately on mount, before any rendering
    const savedTheme = localStorage.getItem("pdf-merger-theme") || "dark";
    const savedAccessibility = localStorage.getItem("pdf-merger-accessibility");
    
    const themes = {
      dark: {
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
      light: {
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
      blue: {
        primary: "#3B82F6",
        background: "#0F172A",
        secondary: "#1E293B",
        text: "#F1F5F9",
        textSecondary: "#94A3B8",
        border: "#334155",
        accent: "#3B82F6",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      green: {
        primary: "#10B981",
        background: "#064E3B",
        secondary: "#065F46",
        text: "#ECFDF5",
        textSecondary: "#A7F3D0",
        border: "#047857",
        accent: "#10B981",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      purple: {
        primary: "#8B5CF6",
        background: "#1E1B4B",
        secondary: "#312E81",
        text: "#F3F4F6",
        textSecondary: "#C4B5FD",
        border: "#4C1D95",
        accent: "#8B5CF6",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      orange: {
        primary: "#F97316",
        background: "#431407",
        secondary: "#9A3412",
        text: "#FFF7ED",
        textSecondary: "#FDBA74",
        border: "#C2410C",
        accent: "#F97316",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      pink: {
        primary: "#D1006B",
        background: "#1B1F24",
        secondary: "#2D2A33",
        text: "#F1F5F9",
        textSecondary: "#FBBF24",
        border: "#FBBF24",
        accent: "#D1006B",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      yellow: {
        primary: "#FBBF24",
        background: "#1B212C",
        secondary: "#151B24",
        text: "#E1E6EB",
        textSecondary: "#A0AEC0",
        border: "#A0AEC0",
        accent: "#FBBF24",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      gray: {
        primary: "#6B7280",
        background: "#1F2937",
        secondary: "#374151",
        text: "#F3F4F6",
        textSecondary: "#D1D5DB",
        border: "#9CA3AF",
        accent: "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      teal: {
        primary: "#14B8A6",
        background: "#0F172A",
        secondary: "#1E293B",
        text: "#F1F5F9",
        textSecondary: "#94A3B8",
        border: "#334155",
        accent: "#14B8A6",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      zinc : {
        primary: "#3F3F46",
        background: "#1C1C22",
        secondary: "#27272A",
        text: "#F4F4F5",
        textSecondary: "#A1A1AA",
        border: "#4B4B4D",
        accent: "#3F3F46",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      slate: {
        primary: "#64748B",
        background: "#0F172A",
        secondary: "#1E293B",
        text: "#F1F5F9",
        textSecondary: "#94A3B8",
        border: "#334155",
        accent: "#64748B",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
    };

    const accessibilityOptions = {
      fontSize: {
        small: { size: "14px" },
        medium: { size: "16px" },
        large: { size: "18px" },
        extraLarge: { size: "20px" },
      },
      contrast: {
        normal: { filter: "none" },
        high: { filter: "contrast(1.5)" },
        extraHigh: { filter: "contrast(2)" },
      },
    };    const theme = themes[savedTheme];
    const root = document.documentElement;

    // Apply theme colors
    if (theme) {
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    } else if (savedTheme.startsWith('custom-')) {
      // Handle custom themes
      try {
        const customThemes = JSON.parse(localStorage.getItem("pdf-merger-custom-themes") || "[]");
        const customTheme = customThemes.find(theme => theme.id === savedTheme);
        
        if (customTheme && customTheme.colors) {
          Object.entries(customTheme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
          });
        }
      } catch (error) {
        console.error("Failed to parse custom theme:", error);
      }
    }

    // Apply accessibility settings
    if (savedAccessibility) {
      try {
        const accessibility = JSON.parse(savedAccessibility);
        
        root.style.setProperty(
          "--font-size-base",
          accessibilityOptions.fontSize[accessibility.fontSize]?.size || "16px"
        );
        root.style.setProperty(
          "--contrast-filter",
          accessibilityOptions.contrast[accessibility.contrast]?.filter || "none"
        );

        if (accessibility.reduceMotion) {
          root.style.setProperty("--motion-duration", "0s");
        } else {
          root.style.setProperty("--motion-duration", "0.3s");
        }

        // Apply high contrast mode
        if (accessibility.highContrastMode) {
          root.classList.add("high-contrast");
        } else {
          root.classList.remove("high-contrast");
        }

        // Apply focus indicators
        if (accessibility.focusIndicators) {
          root.classList.add("focus-indicators");
        } else {
          root.classList.remove("focus-indicators");
        }
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    }
  }, []);

  return null;
};

export default ThemeInitializer;
