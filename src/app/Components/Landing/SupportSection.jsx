import React, { useState } from "react";
import { motion } from "framer-motion";
import CustomerService from "./CustomerService";

const SupportSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    category: "General",
    subject: "",
    message: "",
    priority: "Medium",
  });

  // Handle support ticket form submission
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    console.log("Support ticket submitted:", ticketForm);
    alert(
      `Thank you ${ticketForm.name}! Your support ticket has been submitted. We'll respond within 24 hours.`
    );
    setTicketForm({
      name: "",
      email: "",
      category: "General",
      subject: "",
      message: "",
      priority: "Medium",
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle contact methods
  const handleContactMethod = (method) => {
    console.log(`${method} clicked`);
    switch (method) {
      case "chat":
        alert(
          "Live chat would open here. Connect with our support team instantly!"
        );
        break;
      case "email":
        window.location.href = "mailto:support@pdfmergepro.com";
        break;
      case "phone":
        alert("Call us at: +1 (555) 123-4567\nBusiness Hours: 9 AM - 6 PM EST");
        break;
      case "forum":
        alert("Community forum would open here. Connect with other users!");
        break;
      default:
        break;
    }
  };

  // FAQ Data
  const faqCategories = {
    General: [
      {
        question: "How does PDFMerge Pro work?",
        answer:
          "Simply upload your PDF files, arrange them in your desired order, and click merge. Our advanced algorithms will combine them into a single, optimized PDF while preserving quality and formatting.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Absolutely! We use military-grade encryption for all file transfers and processing. Your files are automatically deleted from our servers within 1 hour of processing, and we never store or access your content.",
      },
      {
        question: "What file formats do you support?",
        answer:
          "We primarily work with PDF files, but our premium plans also support converting and merging documents from Word, Excel, PowerPoint, images (JPG, PNG), and more into PDF format.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to premium features until the end of your current billing period.",
      },
    ],
    Technical: [
      {
        question: "What are the file size limits?",
        answer:
          "Starter plan: 10MB per file, 50 files per month. Professional plan: No file size limits, unlimited files. Enterprise: Custom limits based on your needs.",
      },
      {
        question: "Why is my merged PDF larger than expected?",
        answer:
          "PDF size can vary based on content complexity, image resolution, and compression settings. Our Pro plans include advanced optimization to minimize file sizes while maintaining quality.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "Yes, but you'll need to provide the passwords during the upload process. We support merging password-protected files while maintaining security throughout the process.",
      },
      {
        question: "Do you have an API for developers?",
        answer:
          "Yes! Our Professional and Enterprise plans include full API access with comprehensive documentation, webhooks, and SDKs for popular programming languages.",
      },
    ],
    Billing: [
      {
        question: "How does the free trial work?",
        answer:
          "Our 14-day free trial gives you full access to Professional features with no credit card required. You can process unlimited files and test all premium features.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise customers. All payments are processed securely.",
      },
      {
        question: "Can I get a refund?",
        answer:
          "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact our support team for a full refund within 30 days of purchase.",
      },
      {
        question: "How does annual billing work?",
        answer:
          "Annual billing gives you a 40% discount compared to monthly plans. You're billed once per year, and you can still cancel anytime with a prorated refund for unused time.",
      },
    ],
  };

  // Support tabs
  const supportTabs = [
    { name: "Help Center", icon: "📚" },
    { name: "Contact Us", icon: "💬" },
    { name: "Submit Ticket", icon: "🎫" },
    { name: "Resources", icon: "📖" },
  ];

  // Contact methods
  const contactMethods = [
    {
      name: "Live Chat",
      description: "Chat with our support team instantly",
      icon: "💬",
      action: () => handleContactMethod("chat"),
      available: "Available 24/7",
      response: "Instant response",
    },
    {
      name: "Email Support",
      description: "Send us detailed questions",
      icon: "📧",
      action: () => handleContactMethod("email"),
      available: "support@pdfmergepro.com",
      response: "Within 4 hours",
    },
    {
      name: "Phone Support",
      description: "Speak with our experts",
      icon: "📞",
      action: () => handleContactMethod("phone"),
      available: "9 AM - 6 PM EST",
      response: "Immediate",
    },
    {
      name: "Community Forum",
      description: "Connect with other users",
      icon: "👥",
      action: () => handleContactMethod("forum"),
      available: "Always open",
      response: "Community driven",
    },
  ];

  // Resources data
  const resources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of PDF merging",
      icon: "🚀",
      link: "#",
    },
    {
      title: "Advanced Features Tutorial",
      description: "Master our premium tools",
      icon: "⚡",
      link: "#",
    },
    {
      title: "API Documentation",
      description: "Integrate with your applications",
      icon: "🔧",
      link: "#",
    },
    {
      title: "Security Best Practices",
      description: "Keep your documents safe",
      icon: "🔐",
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: "🎥",
      link: "#",
    },
    {
      title: "Business Use Cases",
      description: "See real-world examples",
      icon: "💼",
      link: "#",
    },
  ];

  return (
    <section
      id="support"
      className="py-20 bg-gradient-to-b from-theme-secondary to-theme-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-theme-text mb-6">
            We're Here to <span className="text-theme-primary">Help</span>
          </h2>
          <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
            Get the support you need to make the most of PDFMerge Pro. Our team
            is dedicated to your success.
          </p>
        </motion.div>

        {/* Support Tabs */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-theme-background rounded-xl p-2 border border-theme-border flex items-center justify-center gap-8">
            {supportTabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === index
                    ? "btn-primary"
                    : "text-theme-text-secondary hover:text-theme-text"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Support Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Help Center Tab */}
          {activeTab === 0 && (
            <div className="space-y-8">
              {/* FAQ Categories */}
              <div className="flex justify-center mb-8">
                <div className="bg-theme-background rounded-lg p-1 border border-theme-border">
                  {Object.keys(faqCategories).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2 rounded-md transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-theme-primary text-white"
                          : "text-theme-text-secondary hover:text-theme-text"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="grid gap-6 max-w-4xl mx-auto">
                {faqCategories[selectedCategory].map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-theme-background border border-theme-border rounded-xl p-6 hover:border-theme-primary transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-theme-text mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Us Tab */}
          {activeTab === 1 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  className="card-theme p-6 hover:border-theme-primary transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={method.action}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {method.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-theme-text mb-2">
                      {method.name}
                    </h3>
                    <p className="text-theme-text-secondary text-sm mb-4">
                      {method.description}
                    </p>
                    <div className="space-y-2 text-xs text-theme-text-secondary">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 bg-theme-primary rounded-full"></span>
                        <span>{method.available}</span>
                      </div>
                      <div className="text-theme-primary font-medium">
                        {method.response}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Submit Ticket Tab */}
          {activeTab === 2 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-theme-background border border-theme-border rounded-xl p-8">
                <h3 className="text-2xl font-bold text-theme-text mb-6 text-center">
                  Submit a Support Ticket
                </h3>
                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-theme-text font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={ticketForm.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-secondary focus:outline-none focus:border-theme-primary transition-colors duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-theme-text font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={ticketForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-secondary focus:outline-none focus:border-theme-primary transition-colors duration-300"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-theme-text font-medium mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={ticketForm.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:outline-none focus:border-theme-primary transition-colors duration-300"
                      >
                        <option value="General">General Question</option>
                        <option value="Technical">Technical Issue</option>
                        <option value="Billing">Billing & Payment</option>
                        <option value="Feature">Feature Request</option>
                        <option value="Bug">Bug Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-theme-text font-medium mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={ticketForm.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:outline-none focus:border-theme-primary transition-colors duration-300"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-theme-text font-medium mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={ticketForm.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-theme-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-secondary focus:outline-none focus:border-theme-primary transition-colors duration-300"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-theme-text font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={ticketForm.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 bg-theme-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-secondary focus:outline-none focus:border-theme-primary transition-colors duration-300 resize-vertical"
                      placeholder="Please provide detailed information about your question or issue..."
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full btn-primary px-6 py-4 rounded-lg font-semibold transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Support Ticket
                  </motion.button>
                </form>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 3 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  className="card-theme p-6 hover:border-theme-primary transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => alert(`${resource.title} would open here`)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {resource.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-theme-primary transition-colors duration-300">
                      {resource.title}
                    </h3>
                    <p className="text-theme-text-secondary text-sm">
                      {resource.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center my-16 pt-12 border-t border-theme-border"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-theme-text mb-4">
            Still need help?
          </h3>
          <p className="text-theme-text-secondary mb-6">
            Our support team is standing by to help you succeed with PDFMerge
            Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => handleContactMethod("chat")}
              className="btn-primary px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Live Chat
            </motion.button>
            <motion.button
              onClick={() => setActiveTab(2)}
              className="btn-outline-primary px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Ticket
            </motion.button>
          </div>
        </motion.div>

        <CustomerService />
      </div>
    </section>
  );
};

export default SupportSection;
