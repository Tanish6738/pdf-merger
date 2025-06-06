import React from "react";
import { motion } from "framer-motion";

const HeroSection = ({ onNavigate }) => {
  const handleMergeClick = () => {
    console.log("Merge Your PDFs Now clicked!");
    // Navigate to the merger tool
    if (onNavigate) {
      onNavigate("merger");
    }
  };

  const handleBuilderClick = () => {
    console.log("Create PDF clicked!");
    // Navigate to the enhanced PDF builder
    if (onNavigate) {
      onNavigate("builder");
    }
  };

  const handleDemoClick = () => {
    console.log("Watch Demo clicked!");
    // Open demo modal or video
    alert(
      "Demo video would play here, showing how the PDF merge process works."
    );
  };
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 lg:pt-0 bg-theme-background">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-3xl bg-theme-primary"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl bg-theme-primary"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {" "}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-theme-text">
              The Ultimate PDF Tool.{" "}
              <span className="block sm:inline text-theme-primary">
                Merge, Build & Design.
              </span>
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-theme-text-secondary">
              Merge PDFs instantly or create stunning documents with our
              advanced grid-based layout system. Upload images, arrange them
              precisely, and export professional PDFs.
            </p>{" "}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
              {" "}
              <motion.button
                onClick={handleMergeClick}
                className="btn-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl order-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Merge PDFs
              </motion.button>
              <motion.button
                onClick={handleBuilderClick}
                className="btn-outline-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold order-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create PDF
              </motion.button>
            </div>{" "}
            <div className="text-xs sm:text-sm text-center lg:text-left text-theme-text-secondary">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 justify-center lg:justify-start">
                <span className="flex items-center justify-center lg:justify-start">
                  ✓ Advanced grid layout system
                </span>
                <span className="flex items-center justify-center lg:justify-start">
                  ✓ Drag & drop interface
                </span>
                <span className="flex items-center justify-center lg:justify-start">
                  ✓ Professional PDF output
                </span>
              </div>
            </div>
          </motion.div>{" "}
          {/* Visual */}
          <motion.div
            className="relative mt-8 lg:mt-0 order-first lg:order-last"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative z-10">
              {/* PDF Merge Visualization */}{" "}
              <div className="backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border backdrop-blur-theme border-theme-border">
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                    {/* Multiple PDFs */}
                    <div className="flex justify-center space-x-2 sm:space-x-4">
                      {[1, 2, 3].map((i) => (                        <motion.div
                          key={i}
                          className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg shadow-lg flex items-center justify-center bg-theme-secondary border border-theme-border"
                          initial={{ rotate: -10 * i, y: 20 * i }}
                          animate={{ rotate: 0, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                        >
                          {" "}
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8 text-theme-primary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <motion.div
                      className="flex justify-center sm:mx-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.3 }}
                    >
                      {" "}                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 rotate-90 sm:rotate-0 text-theme-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </motion.div>

                    {/* Merged PDF */}
                    <div className="flex justify-center">
                      {" "}
                      <motion.div
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg shadow-xl flex items-center justify-center bg-theme-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                      >
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </div>{" "}
                <div className="text-center">
                  <p className="font-semibold text-sm sm:text-base text-theme-text">
                    Multiple PDFs
                  </p>
                  <p className="text-xs sm:text-sm mt-1 text-theme-text-secondary">
                    Seamlessly combined in seconds
                  </p>
                </div>
              </div>
            </div>
            {/* Floating elements */}{" "}            <motion.div
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-theme-primary-opaque-60"
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>{" "}            <motion.div
              className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-theme-primary-opaque-70"
              animate={{ x: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Trust indicators */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        {" "}
        <div className="backdrop-blur-sm rounded-full px-6 py-3 border bg-theme-primary-opaque-80 border-theme-border">
          <p className="text-sm text-center text-theme-text-secondary">
            <span className="font-semibold text-theme-primary">1M+</span> Files
            Merged Securely •
            <span className="font-semibold text-theme-primary"> 4.9/5</span>{" "}
            User Rating
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
