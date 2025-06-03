import React from "react";
import { motion } from "framer-motion";

const PremiumFeatures = () => {
  const handleTrialClick = () => {
    console.log("Start Your Free Trial clicked from Premium Features!");
    // Navigate to trial signup
    const element = document.getElementById("pricing");
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  const features = [
    {
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      title: "Merge Without Limits",
      description:
        "Combine hundreds of files at once. No restrictions on file size or number of documents. Process enterprise-level batches effortlessly.",
      highlight: "Unlimited Files",
    },
    {
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
      title: "Total Control Over Your Output",
      description:
        "Reorder pages visually, delete specific pages, merge specific page ranges, retain bookmarks and links. Granular control at your fingertips.",
      highlight: "Advanced Organization",
    },
    {
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      title: "Make Scanned PDFs Searchable",
      description:
        "Convert scanned documents into selectable and searchable text during the merge process. OCR technology built right in.",
      highlight: "OCR Technology",
    },
    {
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Your Documents Remain Confidential",
      description:
        "End-to-end encryption, secure processing, and options for password protection on merged files. We never store your files longer than necessary.",
      highlight: "Military-Grade Security",
    },
    {
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      ),
      title: "Access & Merge Anywhere",
      description:
        "Connect with Google Drive, Dropbox, OneDrive, and more to easily import and save your merged PDFs. Work seamlessly across platforms.",
      highlight: "Cloud Integration",
    },
    {
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
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "Dedicated Premium Support",
      description:
        "Get faster response times and dedicated assistance from our expert support team. Priority queue and direct access to specialists.",
      highlight: "Priority Support",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-b from-[#1B212C] to-[#151B24]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB] mb-6">
            Unlock Premium PDF <span className="text-[#00A99D]">Power</span>
          </h2>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto">
            Experience advanced features designed for professionals who demand
            more from their PDF tools. Every feature built with precision and
            purpose.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="h-full bg-[#1B212C] border border-[#A0AEC0]/20 rounded-2xl p-8 hover:border-[#00A99D]/50 transition-all duration-300 relative overflow-hidden">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A99D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Highlight badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-block bg-[#00A99D]/20 text-[#00A99D] text-xs font-semibold px-3 py-1 rounded-full">
                    {feature.highlight}
                  </span>
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-[#00A99D]/10 rounded-xl flex items-center justify-center text-[#00A99D] group-hover:bg-[#00A99D]/20 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-[#E1E6EB] mb-4 group-hover:text-[#00A99D] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-[#A0AEC0] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#00A99D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-[#1B212C] border border-[#A0AEC0]/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#E1E6EB] mb-4">
              Ready to experience the difference?
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              Join thousands of professionals who trust PDFMerge Pro for their
              critical document workflows.
            </p>{" "}
            <motion.button
              onClick={handleTrialClick}
              className="bg-[#00A99D] hover:bg-[#00A99D]/90 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
