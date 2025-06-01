import React, { useState } from "react";
import { motion } from "framer-motion";

const UseCases = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = [
    {
      title: "For Business",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
          />
        </svg>
      ),
      description:
        "Streamline invoicing, report consolidation, and contract management.",
      features: [
        "Combine monthly financial reports",
        "Merge invoices for bulk processing",
        "Consolidate contracts and agreements",
        "Create comprehensive project documentation",
        "Batch process compliance documents",
      ],
      image: "/api/placeholder/400/300",
      stats: { users: "50K+", efficiency: "75%" },
    },
    {
      title: "For Legal Professionals",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3"
          />
        </svg>
      ),
      description:
        "Compile case files, evidence documents, and court submissions efficiently and securely.",
      features: [
        "Organize discovery documents",
        "Compile evidence packages",
        "Merge exhibit collections",
        "Create case file summaries",
        "Secure client document compilation",
      ],
      image: "/api/placeholder/400/300",
      stats: { users: "15K+", efficiency: "80%" },
    },
    {
      title: "For Educators & Students",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      description:
        "Combine research papers, lecture notes, and assignments into single, organized documents.",
      features: [
        "Merge research paper chapters",
        "Combine lecture note collections",
        "Create comprehensive study guides",
        "Organize assignment portfolios",
        "Compile thesis documentation",
      ],
      image: "/api/placeholder/400/300",
      stats: { users: "100K+", efficiency: "70%" },
    },
  ];

  return (
    <section id="use-cases" className="py-20 bg-[#151B24]">
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
            Trusted by{" "}
            <span
              className="text-[#00A99D] glitch-effect"
              data-text="Professionals"
            >
              Professionals
            </span>{" "}
            Worldwide
          </h2>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto text-reveal">
            From startups to Fortune 500 companies, see how different industries
            leverage PDFMerge Pro to streamline their document workflows.
          </p>
        </motion.div>{" "}
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#1B212C] rounded-xl p-2 border border-[#A0AEC0]/20 card-3d">
            {useCases.map((useCase, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 magnetic-pull ripple ${
                  activeTab === index
                    ? "bg-[#00A99D] text-white rotating-border"
                    : "text-[#A0AEC0] hover:text-[#E1E6EB] hover:bg-[#A0AEC0]/10"
                }`}
              >
                <span
                  className={`${activeTab === index ? "text-white elastic-scale" : "text-[#00A99D] float-animation"}`}
                >
                  {useCase.icon}
                </span>
                <span className="font-medium">{useCase.title}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Content */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-[#00A99D]/10 rounded-xl flex items-center justify-center text-[#00A99D]">
                {useCases[activeTab].icon}
              </div>
              <h3 className="text-3xl font-bold text-[#E1E6EB]">
                {useCases[activeTab].title}
              </h3>
            </div>

            <p className="text-xl text-[#A0AEC0] mb-8 leading-relaxed">
              {useCases[activeTab].description}
            </p>

            <div className="space-y-4 mb-8">
              {useCases[activeTab].features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-[#00A99D] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-[#E1E6EB]">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1B212C] border border-[#A0AEC0]/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#00A99D] mb-1">
                  {useCases[activeTab].stats.users}
                </div>
                <div className="text-[#A0AEC0] text-sm">Active Users</div>
              </div>
              <div className="bg-[#1B212C] border border-[#A0AEC0]/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#00A99D] mb-1">
                  {useCases[activeTab].stats.efficiency}
                </div>
                <div className="text-[#A0AEC0] text-sm">Time Saved</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-[#1B212C] border border-[#A0AEC0]/20 rounded-2xl p-8 relative overflow-hidden">
              {/* Demo visualization based on use case */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-[#E1E6EB]">
                    Document Workflow
                  </h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>

                {/* File simulation */}
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-[#151B24] rounded-lg border border-[#A0AEC0]/10"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-8 h-8 bg-[#00A99D]/20 rounded flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#00A99D]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[#E1E6EB] text-sm">
                          Document_{i}.pdf
                        </div>
                        <div className="text-[#A0AEC0] text-xs">2.{i}MB</div>
                      </div>
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2 text-[#00A99D]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span className="text-sm font-medium">Merging...</span>
                  </div>
                </div>

                <motion.div
                  className="p-4 bg-[#00A99D]/10 border border-[#00A99D]/30 rounded-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#00A99D] rounded flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[#E1E6EB] font-medium">
                        Merged_Document.pdf
                      </div>
                      <div className="text-[#A0AEC0] text-sm">
                        8.7MB • Ready for download
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Background decoration */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-[#00A99D]/5 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#00A99D]/5 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCases;
