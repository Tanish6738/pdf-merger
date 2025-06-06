"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Sliders, 
  Palette, 
  Check, 
  RefreshCw, 
  Sparkles,
  Copy,
  Edit,
} from "lucide-react";
import { useTheme } from "./ThemeAccessibilitySettings";

const ColorPicker = ({ label, color, onChange, description }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[var(--color-text,#E1E6EB)] font-medium">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-md border border-[var(--color-border,#A0AEC0)]/30"
            style={{ backgroundColor: color }}
          ></div>
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer bg-transparent"
          />
        </div>
      </div>
      {description && (
        <p className="text-xs text-[var(--color-textSecondary,#A0AEC0)] mb-1">
          {description}
        </p>
      )}
      <div className="relative mt-1 mb-3">
        <div className="w-full h-1 bg-[var(--color-secondary,#151B24)] rounded-full" />
        <div 
          className="absolute top-0 left-0 h-1 rounded-full" 
          style={{ 
            width: '100%', 
            background: `linear-gradient(to right, rgba(255,255,255,0.1), ${color})` 
          }}
        />
      </div>
    </div>
  );
};

const ThemePreview = ({ theme }) => {
  return (
    <div 
      className="rounded-xl overflow-hidden border p-4"
      style={{ 
        backgroundColor: theme.background, 
        borderColor: `${theme.border}40` 
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center" 
          style={{ backgroundColor: theme.primary }}
        >
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 
            className="font-medium" 
            style={{ color: theme.text }}
          >
            Theme Preview
          </h3>
          <p 
            className="text-sm" 
            style={{ color: theme.textSecondary }}
          >
            See your theme in action
          </p>
        </div>
      </div>
      
      <div 
        className="p-3 rounded-lg mb-4" 
        style={{ backgroundColor: theme.secondary, borderColor: `${theme.border}40` }}
      >
        <p style={{ color: theme.text }}>Content area</p>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Secondary background with text
        </p>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: theme.primary }}
        >
          Primary Button
        </button>
        <button 
          className="px-4 py-2 rounded-lg border"
          style={{ 
            color: theme.primary, 
            borderColor: theme.primary 
          }}
        >
          Outline
        </button>
        <button 
          className="px-4 py-2 rounded-lg"
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.textSecondary,
            borderColor: `${theme.border}40`
          }}
        >
          Secondary
        </button>
      </div>
      
      <div className="mt-4 flex gap-3">
        <div 
          className="p-2 rounded-full" 
          style={{ backgroundColor: theme.success }}
        ></div>
        <div 
          className="p-2 rounded-full" 
          style={{ backgroundColor: theme.warning }}
        ></div>
        <div 
          className="p-2 rounded-full" 
          style={{ backgroundColor: theme.error }}
        ></div>
      </div>
    </div>
  );
};

const CustomThemeCreator = () => {
  const { updateTheme, themes } = useTheme();
  const [customThemes, setCustomThemes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [themeDescription, setThemeDescription] = useState("");
  const [editingTheme, setEditingTheme] = useState(null);
  
  const defaultThemeValues = {
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
  };
  
  const [themeColors, setThemeColors] = useState({...defaultThemeValues});
  
  // Load custom themes from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedThemes = localStorage.getItem("pdf-merger-custom-themes");
      if (savedThemes) {
        try {
          setCustomThemes(JSON.parse(savedThemes));
        } catch (error) {
          console.error("Failed to parse custom themes:", error);
        }
      }
    }
  }, []);
  
  // Save custom themes to local storage when updated
  useEffect(() => {
    if (customThemes.length > 0) {
      localStorage.setItem("pdf-merger-custom-themes", JSON.stringify(customThemes));
    }
  }, [customThemes]);
  
  const handleColorChange = (colorKey, value) => {
    setThemeColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };
  
  const resetToDefaultColors = () => {
    setThemeColors({...defaultThemeValues});
  };
  
  const generateRandomTheme = () => {
    // Generate a random primary color
    const hue = Math.floor(Math.random() * 360);
    const primary = `hsl(${hue}, 80%, 50%)`;
    
    // Create a complementary/analogous color scheme
    const accent = `hsl(${(hue + 30) % 360}, 80%, 50%)`;
    const success = `hsl(${(hue + 120) % 360}, 70%, 50%)`;
    const warning = `hsl(${(hue + 180) % 360}, 70%, 60%)`;
    const error = `hsl(${(hue + 300) % 360}, 70%, 60%)`;
    
    // Generate dark mode or light mode randomly
    const isDarkMode = Math.random() > 0.5;
    
    let background, secondary, text, textSecondary, border;
    
    if (isDarkMode) {
      // Dark theme
      background = `hsl(${hue}, 20%, 10%)`;
      secondary = `hsl(${hue}, 15%, 15%)`;
      text = `hsl(${hue}, 10%, 90%)`;
      textSecondary = `hsl(${hue}, 10%, 70%)`;
      border = `hsl(${hue}, 10%, 50%)`;
    } else {
      // Light theme
      background = `hsl(${hue}, 10%, 98%)`;
      secondary = `hsl(${hue}, 10%, 94%)`;
      text = `hsl(${hue}, 15%, 15%)`;
      textSecondary = `hsl(${hue}, 10%, 40%)`;
      border = `hsl(${hue}, 10%, 80%)`;
    }
    
    setThemeColors({
      primary,
      background,
      secondary,
      text,
      textSecondary,
      border,
      accent,
      success,
      warning,
      error,
    });
  };
  
  const saveCustomTheme = () => {
    if (!themeName.trim()) {
      alert("Please enter a theme name");
      return;
    }
    
    const newTheme = {
      id: editingTheme ? editingTheme.id : `custom-${Date.now()}`,
      name: themeName,
      description: themeDescription || "Custom theme",
      colors: {...themeColors},
    };
    
    if (editingTheme) {
      // Update existing theme
      setCustomThemes(prev => 
        prev.map(theme => theme.id === editingTheme.id ? newTheme : theme)
      );
    } else {
      // Add new theme
      setCustomThemes(prev => [...prev, newTheme]);
    }
    
    // Reset and close the creator
    resetCreator();
  };
  
  const resetCreator = () => {
    setIsCreating(false);
    setThemeName("");
    setThemeDescription("");
    setThemeColors({...defaultThemeValues});
    setEditingTheme(null);
  };
  
  const editTheme = (theme) => {
    setEditingTheme(theme);
    setThemeName(theme.name);
    setThemeDescription(theme.description);
    setThemeColors({...theme.colors});
    setIsCreating(true);
  };
  
  const deleteTheme = (themeId) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
    }
  };
  
  const applyTheme = (theme) => {
    // Register the custom theme in the theme context
    updateTheme(theme.id);
    
    // Apply the theme directly to the DOM
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Save the selected theme to localStorage
    localStorage.setItem("pdf-merger-theme", theme.id);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text,#E1E6EB)]">
          Custom Themes
        </h3>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[var(--color-primary,#00A99D)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Create Theme
          </button>
        )}
      </div>
      
      {/* Theme Creator */}
      {isCreating ? (
        <motion.div 
          className="bg-[var(--color-secondary,#151B24)] rounded-xl border border-[var(--color-border,#A0AEC0)]/20 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-md font-semibold text-[var(--color-text,#E1E6EB)]">
              {editingTheme ? `Edit Theme: ${editingTheme.name}` : "Create New Theme"}
            </h4>
            <div className="flex gap-2">
              <button 
                onClick={generateRandomTheme}
                className="p-2 bg-[var(--color-background,#1B212C)] text-[var(--color-text,#E1E6EB)] rounded-lg hover:bg-[var(--color-primary,#00A99D)]/10 transition-colors"
                title="Generate Random Theme"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button 
                onClick={resetToDefaultColors}
                className="p-2 bg-[var(--color-background,#1B212C)] text-[var(--color-text,#E1E6EB)] rounded-lg hover:bg-[var(--color-primary,#00A99D)]/10 transition-colors"
                title="Reset to Default Colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Color Controls */}
            <div>
              <div className="mb-4">
                <label className="block text-[var(--color-text,#E1E6EB)] font-medium mb-1">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="My Custom Theme"
                  className="w-full p-2 rounded-lg bg-[var(--color-background,#1B212C)] border border-[var(--color-border,#A0AEC0)]/30 text-[var(--color-text,#E1E6EB)]"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-[var(--color-text,#E1E6EB)] font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  placeholder="A brief description of your theme"
                  className="w-full p-2 rounded-lg bg-[var(--color-background,#1B212C)] border border-[var(--color-border,#A0AEC0)]/30 text-[var(--color-text,#E1E6EB)]"
                />
              </div>
              
              <div className="space-y-1">
                <h5 className="text-[var(--color-text,#E1E6EB)] font-medium mb-3">
                  <Sliders className="w-4 h-4 inline mr-2" />
                  Color Settings
                </h5>
                
                <ColorPicker 
                  label="Primary Color" 
                  color={themeColors.primary}
                  onChange={(value) => handleColorChange('primary', value)}
                  description="Main brand color, used for buttons and accents"
                />
                
                <ColorPicker 
                  label="Background" 
                  color={themeColors.background}
                  onChange={(value) => handleColorChange('background', value)}
                  description="Main background color"
                />
                
                <ColorPicker 
                  label="Secondary Background" 
                  color={themeColors.secondary}
                  onChange={(value) => handleColorChange('secondary', value)}
                  description="Used for cards, panels and secondary elements"
                />
                
                <ColorPicker 
                  label="Text Color" 
                  color={themeColors.text}
                  onChange={(value) => handleColorChange('text', value)}
                  description="Primary text color"
                />
                
                <ColorPicker 
                  label="Secondary Text" 
                  color={themeColors.textSecondary}
                  onChange={(value) => handleColorChange('textSecondary', value)}
                  description="Used for less important text elements"
                />
                
                <ColorPicker 
                  label="Border Color" 
                  color={themeColors.border}
                  onChange={(value) => handleColorChange('border', value)}
                  description="Used for borders and dividers"
                />
                
                <ColorPicker 
                  label="Accent Color" 
                  color={themeColors.accent}
                  onChange={(value) => handleColorChange('accent', value)}
                  description="Secondary accent color"
                />
                
                <ColorPicker 
                  label="Success Color" 
                  color={themeColors.success}
                  onChange={(value) => handleColorChange('success', value)}
                  description="Used for success states"
                />
                
                <ColorPicker 
                  label="Warning Color" 
                  color={themeColors.warning}
                  onChange={(value) => handleColorChange('warning', value)}
                  description="Used for warnings and cautions"
                />
                
                <ColorPicker 
                  label="Error Color" 
                  color={themeColors.error}
                  onChange={(value) => handleColorChange('error', value)}
                  description="Used for errors and destructive actions"
                />
              </div>
            </div>
            
            {/* Right Column: Live Preview */}
            <div>
              <h5 className="text-[var(--color-text,#E1E6EB)] font-medium mb-4">
                Live Preview
              </h5>
              
              <ThemePreview theme={themeColors} />
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={resetCreator}
                  className="px-4 py-2 border border-[var(--color-border,#A0AEC0)]/30 text-[var(--color-textSecondary,#A0AEC0)] rounded-lg hover:text-[var(--color-text,#E1E6EB)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveCustomTheme}
                  className="px-4 py-2 bg-[var(--color-primary,#00A99D)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingTheme ? "Update Theme" : "Save Theme"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Custom Theme List */}
          {customThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customThemes.map((theme) => (
                <motion.div
                  key={theme.id}
                  className="bg-[var(--color-secondary,#151B24)] rounded-xl border border-[var(--color-border,#A0AEC0)]/20 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[var(--color-text,#E1E6EB)]">
                        {theme.name}
                      </h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editTheme(theme)}
                          className="p-1.5 text-[var(--color-textSecondary,#A0AEC0)] hover:text-[var(--color-text,#E1E6EB)] transition-colors"
                          title="Edit theme"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTheme(theme.id)}
                          className="p-1.5 text-[var(--color-textSecondary,#A0AEC0)] hover:text-red-400 transition-colors"
                          title="Delete theme"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-textSecondary,#A0AEC0)] mb-4">
                      {theme.description}
                    </p>
                    
                    {/* Color Preview */}
                    <div className="flex gap-1.5 mb-4">
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      ></div>
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: theme.colors.background }}
                        title="Background"
                      ></div>
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: theme.colors.secondary }}
                        title="Secondary"
                      ></div>
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: theme.colors.text }}
                        title="Text"
                      ></div>
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      ></div>
                    </div>
                    
                    <button
                      onClick={() => applyTheme(theme)}
                      className="w-full py-2 border border-[var(--color-primary,#00A99D)] text-[var(--color-primary,#00A99D)] rounded-lg hover:bg-[var(--color-primary,#00A99D)] hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Apply Theme
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--color-secondary,#151B24)]/50 rounded-xl border border-dashed border-[var(--color-border,#A0AEC0)]/20 p-8 text-center">
              <div className="flex justify-center mb-3">
                <Palette className="w-10 h-10 text-[var(--color-textSecondary,#A0AEC0)]" />
              </div>
              <h4 className="text-lg font-medium text-[var(--color-text,#E1E6EB)] mb-2">
                No Custom Themes Yet
              </h4>
              <p className="text-[var(--color-textSecondary,#A0AEC0)] mb-6">
                Create your first custom theme to personalize your experience
              </p>
              <button 
                onClick={() => setIsCreating(true)}
                className="px-5 py-2 bg-[var(--color-primary,#00A99D)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Your First Theme
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomThemeCreator;
