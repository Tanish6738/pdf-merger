import React, { useState } from "react";
import { motion } from "framer-motion";

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const handlePlanClick = (planName, planCta) => {
    console.log(`${planCta} clicked for ${planName} plan`);

    if (planCta === "Contact Sales") {
      // Handle Enterprise contact sales
      alert(
        "Enterprise sales contact would open here. We'll connect you with our sales team!"
      );
    } else if (
      planCta === "Start Free Trial" ||
      planCta === "Choose Professional"
    ) {
      // Handle trial start or plan selection
      alert(
        `Starting ${planName} plan setup. You would be redirected to the signup page.`
      );
    }
  };
  const handleBillingToggle = (type) => {
    console.log(`Billing toggle: ${type}`);
    setBillingPeriod(type);
  };

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 9,
      annualPrice: 5.4, // 40% discount
      description: "Perfect for individuals and small teams",
      features: [
        "Merge up to 50 files per month",
        "Files up to 10MB each",
        "Basic organization tools",
        "Standard support",
        "Cloud storage integration",
        "Mobile app access",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      monthlyPrice: 19,
      annualPrice: 11.4, // 40% discount
      description: "Ideal for businesses and power users",
      features: [
        "Unlimited file merging",
        "No file size restrictions",
        "Advanced organization tools",
        "OCR for scanned documents",
        "Priority support",
        "Team collaboration features",
        "API access",
        "Custom branding",
      ],
      cta: "Choose Professional",
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: null,
      annualPrice: null,
      description: "Tailored solutions for large organizations",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security features",
        "SLA guarantees",
        "Training and onboarding",
        "Multi-tenant deployment",
        "24/7 phone support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  // Helper function to get plan price and period
  const getPlanPrice = (plan) => {
    if (plan.name === "Enterprise") {
      return { price: "Custom", period: "" };
    }

    const currentPrice =
      billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice;
    const period =
      billingPeriod === "annual" ? "/month, billed annually" : "/month";

    return {
      price: `$${currentPrice}`,
      period: period,
    };
  };

  return (
    <section id="pricing" className="py-20 bg-[#1B212C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB] mb-6">
            Simple, Transparent <span className="text-[#00A99D]">Pricing</span>
          </h2>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans come with a 14-day
            free trial and our 30-day money-back guarantee.
          </p>{" "}
          {/* Billing toggle */}
          <div className="inline-flex items-center bg-[#151B24] border border-[#A0AEC0]/20 rounded-lg p-1">
            <button
              onClick={() => handleBillingToggle("monthly")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-[#00A99D] text-white"
                  : "text-[#A0AEC0] hover:text-[#E1E6EB]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingToggle("annual")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === "annual"
                  ? "bg-[#00A99D] text-white"
                  : "text-[#A0AEC0] hover:text-[#E1E6EB]"
              }`}
            >
              Annual (Save 40%)
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative bg-[#151B24] border-2 rounded-2xl p-8 transition-all duration-300 hover:border-[#00A99D]/50 ${
                plan.popular
                  ? "border-[#00A99D] shadow-lg shadow-[#00A99D]/20 scale-105"
                  : "border-[#A0AEC0]/20"
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#00A99D] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}{" "}
              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#E1E6EB] mb-2">
                  {plan.name}
                </h3>
                <p className="text-[#A0AEC0] mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl lg:text-5xl font-bold text-[#E1E6EB]">
                    {getPlanPrice(plan).price}
                  </span>
                  <span className="text-[#A0AEC0] ml-1">
                    {getPlanPrice(plan).period}
                  </span>
                </div>

                {billingPeriod === "annual" && plan.name !== "Enterprise" && (
                  <p className="text-[#00A99D] text-sm font-medium">
                    Save 40% with annual billing
                  </p>
                )}
              </div>
              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-[#00A99D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
                  </li>
                ))}
              </ul>{" "}
              {/* CTA */}
              <motion.button
                onClick={() => handlePlanClick(plan.name, plan.cta)}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#00A99D] hover:bg-[#00A99D]/90 text-white"
                    : "border-2 border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-[#151B24] border border-[#A0AEC0]/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#E1E6EB] mb-4">
              Enterprise-Grade Security for Everyone
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              All plans include end-to-end encryption, GDPR compliance, and SOC
              2 Type II certification. Your documents are processed securely and
              never stored longer than necessary.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#00A99D]/10 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-[#00A99D]"
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
                </div>
                <h4 className="text-[#E1E6EB] font-semibold mb-1">
                  Money-Back Guarantee
                </h4>
                <p className="text-[#A0AEC0] text-sm">
                  30-day full refund policy
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#00A99D]/10 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-[#00A99D]"
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
                </div>
                <h4 className="text-[#E1E6EB] font-semibold mb-1">
                  24/7 Support
                </h4>
                <p className="text-[#A0AEC0] text-sm">
                  Expert help when you need it
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#00A99D]/10 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-[#00A99D]"
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
                </div>
                <h4 className="text-[#E1E6EB] font-semibold mb-1">
                  Instant Setup
                </h4>
                <p className="text-[#A0AEC0] text-sm">
                  Start merging in under 60 seconds
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
