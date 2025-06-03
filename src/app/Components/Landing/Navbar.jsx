import React, { useState } from "react";
import { motion } from "framer-motion";

const Navbar = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleNavClick = (sectionId) => {
    // Handle navigation to different app views
    const appViews = [
      "merger",
      "builder",
      "simple-builder",
      "advanced-tools",
      "cloud",
      "security",
      "analytics",
      "export",
      "settings",
    ];

    if (appViews.includes(sectionId)) {
      if (onNavigate) {
        onNavigate(sectionId);
      }
      setIsMenuOpen(false);
      return;
    }

    // Handle scrolling to sections on landing page
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const handleAuthClick = (action) => {
    console.log(`${action} clicked`);
    if (action === "login") {
      alert("Login page would open here");
    } else if (action === "trial") {
      alert("Free trial signup would start here");
    }
  };
  const handleSupportClick = () => {
    console.log("Support clicked");
    const element = document.getElementById("support");
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{
        backgroundColor: "var(--color-background)",
        opacity: 0.95,
        borderColor: "var(--color-border)",
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}{" "}
          <div className="flex-shrink-0">            <div className="flex items-center">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 bg-theme-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>              <span
                className="text-lg sm:text-xl font-bold text-theme-text"
              >
                <span className="hidden xs:inline">PDFMerge Pro</span>
                <span className="xs:hidden">PDF Pro</span>
              </span>
            </div>
          </div>{" "}
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6 xl:space-x-8">
              {/* PDF Tools Dropdown */}
              <div className="relative group">                <button
                  className="px-3 py-2 text-sm font-medium transition-colors flex items-center text-theme-text hover:text-theme-primary"
                >
                  PDF Tools
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-theme-secondary border border-theme-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {" "}                  <button
                    onClick={() => handleNavClick("merger")}
                    className="block w-full text-left px-4 py-2 text-sm text-theme-text hover:text-theme-primary hover:bg-theme-primary-opaque-10"
                  >
                    PDF Merger
                  </button>
                  {/* <button
                    onClick={() => handleNavClick("split-pdf")}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                  >
                    Split PDF
                  </button> */}
                  <button
                    onClick={() => handleNavClick("builder")}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                  >
                    PDF Builder (Advanced)
                  </button>
                  <button
                    onClick={() => handleNavClick("simple-builder")}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                  >
                    Images to PDF (Simple)
                  </button>
                  <button
                    onClick={() => handleNavClick("advanced-tools")}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                  >
                    Advanced Tools
                  </button>
                </div>
              </div>              <button
                onClick={() => handleNavClick("cloud")}
                className="text-theme-text hover:text-theme-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Cloud
              </button>
              <button
                onClick={() => handleNavClick("security")}
                className="text-theme-text hover:text-theme-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Security
              </button>
              <button
                onClick={() => handleNavClick("analytics")}
                className="text-theme-text hover:text-theme-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Analytics
              </button>
              <button
                onClick={() => handleNavClick("export")}
                className="text-theme-text hover:text-theme-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => handleNavClick("settings")}
                className="text-theme-text hover:text-theme-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Settings
              </button>
            </div>
          </div>{" "}
          {/* CTA Button */}
          <div className="hidden sm:block lg:block">
            <button
              onClick={() => handleAuthClick("trial")}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Try Free for 14 Days</span>
              <span className="sm:hidden">Try Free</span>
            </button>
          </div>
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[var(--color-text)] hover:text-[var(--color-primary)] focus:outline-none p-1"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>{" "}
        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            className="lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {" "}
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[var(--color-secondary)]/95 backdrop-blur-sm border-t border-[var(--color-border)]/10">
              {/* PDF Tools Section */}
              <div className="border-b border-[var(--color-border)]/10 pb-2 mb-2">
                <p className="text-[var(--color-textSecondary)] text-sm font-medium px-3 py-1 uppercase tracking-wide">
                  PDF Tools
                </p>{" "}
                <button
                  onClick={() => handleNavClick("merger")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  PDF Merger
                </button>
                <button
                  onClick={() => handleNavClick("split-pdf")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Split PDF
                </button>
                <button
                  onClick={() => handleNavClick("builder")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  PDF Builder
                </button>
                <button
                  onClick={() => handleNavClick("advanced-tools")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Advanced Tools
                </button>
              </div>

              {/* Features Section */}
              <div className="border-b border-[var(--color-border)]/10 pb-2 mb-2">
                <p className="text-[var(--color-textSecondary)] text-sm font-medium px-3 py-1 uppercase tracking-wide">
                  Features
                </p>
                <button
                  onClick={() => handleNavClick("cloud")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Cloud Integration
                </button>
                <button
                  onClick={() => handleNavClick("security")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Security Features
                </button>
                <button
                  onClick={() => handleNavClick("analytics")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Analytics
                </button>
                <button
                  onClick={() => handleNavClick("export")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Export & Sharing
                </button>
                <button
                  onClick={() => handleNavClick("settings")}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Settings
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleAuthClick("trial")}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Try Free for 14 Days
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
