import React from "react";
import { motion } from "framer-motion";

const FinalCTA = () => {
  const handleStartTrial = () => {
    console.log("Start Free Trial clicked from CTA!");
    // Add your trial start logic here
    // For demo, scroll to pricing
    const element = document.getElementById("pricing");
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleScheduleDemo = () => {
    console.log("Schedule Demo clicked!");
    // Add your demo scheduling logic here
    alert("Demo scheduling would open here");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#1B212C] via-[#151B24] to-[#1B212C] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00A99D] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#00A99D] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-[#E1E6EB] mb-6 leading-tight">
            Ready to Experience
            <span className="block text-[#00A99D]">Seamless PDF Merging?</span>
          </h2>

          <p className="text-xl lg:text-2xl text-[#A0AEC0] mb-12 leading-relaxed">
            Save time, improve organization, and ensure document integrity. Join
            thousands of professionals who trust PDFMerge Pro.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            {" "}
            <motion.button
              onClick={handleStartTrial}
              className="bg-[#00A99D] hover:bg-[#00A99D]/90 text-white px-10 py-5 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Trial
            </motion.button>
            <motion.button
              onClick={handleScheduleDemo}
              className="border-2 border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white px-10 py-5 rounded-xl text-lg font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule Demo
            </motion.button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-[#A0AEC0]">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-10 left-10 w-16 h-16 bg-[#00A99D]/20 rounded-full flex items-center justify-center"
          animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          <svg
            className="w-8 h-8 text-[#00A99D]"
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

        <motion.div
          className="absolute top-20 right-20 w-12 h-12 bg-[#00A99D]/30 rounded-lg flex items-center justify-center"
          animate={{ x: [-5, 5, -5], rotate: [0, -180, -360] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <svg
            className="w-6 h-6 text-[#00A99D]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-20 w-20 h-20 bg-[#00A99D]/10 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <svg
            className="w-10 h-10 text-[#00A99D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
