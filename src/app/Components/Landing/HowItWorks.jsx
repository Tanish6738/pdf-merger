import React from "react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: "Upload",
      description:
        "Easily upload multiple PDF files from your device or cloud storage.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      step: 2,
      title: "Arrange & Customize",
      description:
        "Drag & drop to reorder. Advanced options for page ranges, bookmarks.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      step: 3,
      title: "Merge",
      description:
        "Click 'Merge' and download your perfectly combined PDF instantly.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#1B212C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {" "}
          <h2 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB] mb-6 neon-glow">
            Merge PDFs in{" "}
            <span className="text-[#00A99D] glitch-effect" data-text="Seconds">
              Seconds
            </span>
          </h2>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto text-reveal">
            Our streamlined process makes PDF merging effortless. From upload to
            download, experience the fastest and most intuitive workflow.
          </p>
        </motion.div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-[#00A99D] to-transparent transform -translate-y-1/2 z-0"></div>
              )}

              {/* Mobile connection arrow */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center mt-6 mb-6">
                  <div className="w-6 h-6 text-[#00A99D]">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <div className="relative z-10 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-2xl p-6 md:p-8 text-center hover:border-[#00A99D]/50 transition-all duration-300 group">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#00A99D] text-white rounded-full text-lg md:text-2xl font-bold mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#00A99D]/10 rounded-full flex items-center justify-center text-[#00A99D] group-hover:bg-[#00A99D]/20 transition-colors duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-2xl font-bold text-[#E1E6EB] mb-3 md:mb-4">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-[#A0AEC0] leading-relaxed">
                  {step.description}
                </p>

                {/* Hover effect decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A99D]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>{" "}
        {/* Additional info */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="inline-flex items-center space-x-8 bg-[#1B212C]/60 backdrop-blur-sm rounded-full px-8 py-4 border border-[#A0AEC0]/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[#A0AEC0] text-sm">
                Average processing time: 3-5 seconds
              </span>
            </div>
            <div className="w-px h-4 bg-[#A0AEC0]/30"></div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-[#00A99D]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[#A0AEC0] text-sm">
                Files processed securely and deleted after 1 hour
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
