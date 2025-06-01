import React, { useState } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
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
      className="sticky top-0 z-50 bg-[#1B212C]/95 backdrop-blur-sm border-b border-[#A0AEC0]/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00A99D] rounded-lg flex items-center justify-center mr-2 sm:mr-3">
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
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#E1E6EB]">
                <span className="hidden xs:inline">PDFMerge Pro</span>
                <span className="xs:hidden">PDF Pro</span>
              </span>
            </div>
          </div>{" "}          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6 xl:space-x-8">
              <a
                href="/merge"
                className="text-[#E1E6EB] hover:text-[#00A99D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Merge Tool
              </a>
              <button
                onClick={() => handleNavClick("features")}
                className="text-[#E1E6EB] hover:text-[#00A99D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick("pricing")}
                className="text-[#E1E6EB] hover:text-[#00A99D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavClick("use-cases")}
                className="text-[#E1E6EB] hover:text-[#00A99D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Use Cases
              </button>
              <button
                onClick={handleSupportClick}
                className="text-[#E1E6EB] hover:text-[#00A99D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Support
              </button>
              <button
                onClick={() => handleAuthClick("login")}
                className="text-[#E1E6EB] hover:text-[#00A99D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </button>
            </div>
          </div>{" "}
          {/* CTA Button */}
          <div className="hidden sm:block lg:block">
            <button
              onClick={() => handleAuthClick("trial")}
              className="bg-[#00A99D] hover:bg-[#00A99D]/90 text-white px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Try Free for 14 Days</span>
              <span className="sm:hidden">Try Free</span>
            </button>
          </div>
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#E1E6EB] hover:text-[#00A99D] focus:outline-none p-1"
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
            {" "}            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1B212C]/95 backdrop-blur-sm border-t border-[#A0AEC0]/10">
              <a
                href="/merge"
                className="text-[#E1E6EB] hover:text-[#00A99D] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Merge Tool
              </a>
              <button
                onClick={() => handleNavClick("features")}
                className="text-[#E1E6EB] hover:text-[#00A99D] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick("pricing")}
                className="text-[#E1E6EB] hover:text-[#00A99D] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavClick("use-cases")}
                className="text-[#E1E6EB] hover:text-[#00A99D] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Use Cases
              </button>
              <button
                onClick={handleSupportClick}
                className="text-[#E1E6EB] hover:text-[#00A99D] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Support
              </button>
              <button
                onClick={() => handleAuthClick("login")}
                className="text-[#E1E6EB] hover:text-[#00A99D] block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Login
              </button>
              <div className="pt-2">
                <button
                  onClick={() => handleAuthClick("trial")}
                  className="w-full bg-[#00A99D] hover:bg-[#00A99D]/90 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
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
