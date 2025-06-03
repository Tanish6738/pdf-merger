import React, { useState } from "react";
import { motion } from "framer-motion";

const CustomerService = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "Hi! I'm here to help you with PDFMerge Pro. What can I assist you with today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Handle chat message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      type: "user",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(newMessage);
      const botMsg = {
        id: messages.length + 2,
        type: "bot",
        message: botResponse,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);

    setNewMessage("");
  };

  // Generate bot responses based on keywords
  const generateBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (
      msg.includes("price") ||
      msg.includes("cost") ||
      msg.includes("billing")
    ) {
      return "Our pricing starts at $9/month for the Starter plan. We offer a 14-day free trial and 30-day money-back guarantee. Would you like me to show you our pricing details?";
    } else if (msg.includes("help") || msg.includes("support")) {
      return "I'm here to help! You can reach our support team via live chat (24/7), email (response within 4 hours), or phone (9 AM - 6 PM EST). What specific issue are you facing?";
    } else if (msg.includes("merge") || msg.includes("pdf")) {
      return "PDFMerge Pro makes it easy to merge PDFs! Simply upload your files, arrange them in order, and click merge. We support unlimited files with advanced features like OCR and security options.";
    } else if (msg.includes("security") || msg.includes("safe")) {
      return "Your documents are completely secure! We use military-grade encryption, and all files are automatically deleted from our servers within 1 hour. We're GDPR compliant and SOC 2 certified.";
    } else if (msg.includes("trial") || msg.includes("free")) {
      return "Yes! We offer a 14-day free trial with full access to Professional features. No credit card required to start. Would you like me to help you get started?";
    } else {
      return "Thanks for your question! Let me connect you with a human agent who can provide more detailed assistance. In the meantime, you can check our Help Center or submit a support ticket for faster resolution.";
    }
  };

  // Quick action buttons
  const quickActions = [
    {
      title: "Start Free Trial",
      description: "Get 14 days of premium features",
      icon: "🚀",
      action: () => {
        const element = document.getElementById("pricing");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
    {
      title: "View Documentation",
      description: "Learn how to use our features",
      icon: "📖",
      action: () => alert("Documentation would open here"),
    },
    {
      title: "Contact Sales",
      description: "Speak with our enterprise team",
      icon: "💼",
      action: () => alert("Sales contact form would open here"),
    },
    {
      title: "Report a Bug",
      description: "Help us improve the platform",
      icon: "🐛",
      action: () => {
        const element = document.getElementById("support");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
  ];

  // Service stats
  const serviceStats = [
    { label: "Average Response Time", value: "< 4 hours", icon: "⚡" },
    { label: "Customer Satisfaction", value: "98.5%", icon: "😊" },
    { label: "Issues Resolved", value: "24/7", icon: "🛠️" },
    { label: "Support Languages", value: "12+", icon: "🌍" },
  ];

  return (
    <div className="relative">
      {/* Floating Chat Widget */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >        {!chatOpen ? (
          <motion.button
            onClick={() => setChatOpen(true)}
            className="btn-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="hidden sm:inline font-medium">Need Help?</span>
          </motion.button>
        ) : (          <motion.div
            className="bg-theme-background border-theme-border border rounded-lg shadow-2xl w-80 sm:w-96 max-h-96 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >            {/* Chat Header */}
            <div
              className="bg-theme-primary text-white p-4 rounded-t-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">CS</span>
                </div>
                <div>
                  <h3 className="font-semibold">Customer Support</h3>
                  <p className="text-xs opacity-90">
                    Usually replies in minutes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 max-h-64 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.type === "user" 
                        ? "bg-theme-primary text-white" 
                        : "bg-theme-secondary border border-theme-border text-theme-text"
                    }`}
                  >
                    <p>{msg.message}</p>{" "}
                    <p
                      className={`text-xs mt-1 ${
                        msg.type === "user"
                          ? "text-white opacity-70"
                          : "text-theme-text-secondary"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-theme-border"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="input-theme flex-1 text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary text-white p-2 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>      {/* Quick Actions Section (for support page) */}
      <div className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold mb-4 text-theme-text">
              Quick Actions
            </h3>
            <p className="max-w-2xl mx-auto text-theme-text-secondary">
              Get started quickly with these common tasks and resources.
            </p>
          </motion.div>          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="card-theme border rounded-xl p-6 transition-all duration-300 cursor-pointer group"
                onClick={action.action}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-theme-text group-hover:text-theme-primary transition-colors duration-300">
                    {action.title}
                  </h4>
                  <p className="text-sm text-theme-text-secondary">
                    {action.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>      {/* Service Stats */}
      <div className="py-12 bg-theme-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold mb-4 text-theme-text">
              Our Commitment to You
            </h3>
            <p className="max-w-2xl mx-auto text-theme-text-secondary">
              We're dedicated to providing exceptional support and service to
              all our customers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceStats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-2xl font-bold mb-2 text-theme-primary">
                  {stat.value}
                </div>
                <div className="text-theme-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;
