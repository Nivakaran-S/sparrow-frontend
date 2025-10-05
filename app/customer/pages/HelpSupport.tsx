"use client";
import { useState } from "react";

const HelpSupport = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    message: ""
  });

  const faqCategories = [
    { id: "all", label: "All Topics", icon: "📚" },
    { id: "shipping", label: "Shipping", icon: "📦" },
    { id: "tracking", label: "Tracking", icon: "🔍" },
    { id: "payment", label: "Payment", icon: "💳" },
    { id: "account", label: "Account", icon: "👤" }
  ];

  const faqs = [
    {
      id: 1,
      category: "shipping",
      question: "How do I create a new shipment?",
      answer: "To create a new shipment, navigate to 'Create Shipment' from the sidebar, fill in the sender and receiver information, add parcel details, and submit. You'll receive a tracking number immediately."
    },
    {
      id: 2,
      category: "shipping",
      question: "What items are prohibited for shipping?",
      answer: "Prohibited items include hazardous materials, illegal substances, perishable goods without proper packaging, and items that violate international shipping regulations."
    },
    {
      id: 3,
      category: "tracking",
      question: "How do I track my parcel?",
      answer: "Go to 'Track Shipment' and enter your tracking number. You'll see real-time updates on your parcel's location and status."
    },
    {
      id: 4,
      category: "tracking",
      question: "Why isn't my tracking number working?",
      answer: "Tracking information may take 24-48 hours to appear in the system after shipment creation. If it's been longer, please contact support."
    },
    {
      id: 5,
      category: "payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers."
    },
    {
      id: 6,
      category: "payment",
      question: "How do I update my payment information?",
      answer: "Navigate to 'Billing & Payment' > 'Payment Methods' to add, update, or remove payment methods from your account."
    },
    {
      id: 7,
      category: "account",
      question: "How do I change my account information?",
      answer: "Go to 'Profile Settings' where you can update your personal information, contact details, and preferences."
    },
    {
      id: 8,
      category: "account",
      question: "How do I reset my password?",
      answer: "Click on your profile icon, select 'Security', and choose 'Change Password'. You'll need to enter your current password to set a new one."
    }
  ];

  const quickLinks = [
    { title: "Getting Started Guide", icon: "🚀", description: "Learn the basics of using our platform" },
    { title: "Shipping Rates", icon: "💰", description: "View our competitive shipping rates" },
    { title: "Service Areas", icon: "🌍", description: "Check if we deliver to your location" },
    { title: "API Documentation", icon: "📄", description: "Integrate with our API" }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support ticket submitted! We'll get back to you within 24 hours.");
    setFormData({ subject: "", category: "general", message: "" });
    setShowContactForm(false);
  };

  return (
    <div className="text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Help & Support</h2>
        <p className="text-gray-400">Find answers to your questions or contact our support team</p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 p-6 rounded-xl border border-blue-700 hover:border-blue-500 transition-all cursor-pointer">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
          <p className="text-gray-400 text-sm mb-4">Chat with our support team</p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Start Chat
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-700 hover:border-green-500 transition-all cursor-pointer">
          <div className="text-4xl mb-3">📧</div>
          <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
          <p className="text-gray-400 text-sm mb-4">support@sparrow.com</p>
          <button 
            onClick={() => setShowContactForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Send Email
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-6 rounded-xl border border-purple-700 hover:border-purple-500 transition-all cursor-pointer">
          <div className="text-4xl mb-3">📞</div>
          <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
          <p className="text-gray-400 text-sm mb-4">+1 (800) 123-4567</p>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            Call Now
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <div className="text-3xl mb-2">{link.icon}</div>
            <h4 className="text-white font-semibold mb-1">{link.title}</h4>
            <p className="text-gray-400 text-sm">{link.description}</p>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
        <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>

        {/* Search and Filter */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-4"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {faqCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <details key={faq.id} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-gray-800 transition-colors">
                  <span className="text-white font-medium">{faq.question}</span>
                  <span className="text-blue-400 transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 py-4 border-t border-gray-700">
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              </details>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p>No FAQs found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full">
            <div className="border-b border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Contact Support</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="shipping">Shipping Issue</option>
                  <option value="tracking">Tracking Problem</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Support</option>
                  <option value="technical">Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Hours */}
      <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Support Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
          <div>
            <p className="font-semibold text-white mb-2">📞 Phone Support</p>
            <p>Monday - Friday: 8:00 AM - 8:00 PM EST</p>
            <p>Saturday: 9:00 AM - 5:00 PM EST</p>
            <p>Sunday: Closed</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">💬 Live Chat & Email</p>
            <p>Available 24/7</p>
            <p>Response time: Within 2 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;