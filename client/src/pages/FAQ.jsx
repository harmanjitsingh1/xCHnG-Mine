import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// Sample Data for your Application
const faqData = [
  {
    question: "How do exchanges work?",
    answer:
      "Exchanging is simple. List your item, browse available items from other users, and send a swap request. Once accepted, we help coordinate the exchange details.",
  },
  {
    question: "Is there a fee to join?",
    answer:
      "Creating an account is completely free. We only charge a small service fee when a successful exchange is confirmed to cover platform maintenance.",
  },
  {
    question: "How do I verify my identity?",
    answer:
      "To ensure safety, we require phone number verification during sign-up. You can also upload an ID in your settings for a 'Verified' badge.",
  },
  {
    question: "Can I cancel a request?",
    answer:
      "Yes, you can cancel an exchange request at any time before the other party accepts it. Go to 'My Exchanges' to manage your active requests.",
  },
  {
    question: "What if the item isn't as described?",
    answer:
      "If you receive an item that doesn't match the description, please contact our support team within 24 hours of receipt with photos of the item.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthorized } = useSelector((state) => state.auth);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on search
  const filteredFAQs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen justify-center px-4 py-6 bg-white">
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        {/* Title + Subtext */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Help Center</h2>
          <p className="text-gray-500">
            Everything you need to know about the platform.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-12 !pr-4 !py-2 !text-lg rounded-lg border-2 border-gray-200 focus:border-black !focus-visible:outline-none focus-visible:ring-0 transition-colors"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="w-full space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`flex flex-col rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-black bg-gray-50/50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left focus:outline-none"
                  >
                    <span
                      className={`font-semibold  ${isOpen ? "text-gray-900" : "text-gray-700"}`}
                    >
                      {item.question}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {isOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </span>
                  </button>

                  {/* Answer Content */}
                  <div
                    className={`px-4 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "max-h-48 pb-5 opacity-100"
                        : "max-h-0 pb-0 opacity-0"
                    }`}
                  >
                    {item.answer}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer / CTA */}
        <div className="w-full pt-4 border-t border-gray-100 flex flex-col items-center text-center space-y-3">
          <p className="text-sm text-gray-600">
            Can't find what you're looking for?
          </p>

          <Link
            to="/contact"
            className="text-lg w-full py-2 rounded-lg font-semibold transition-transform shadow-sm cursor-pointer border-2 border-black text-black hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Contact Support
          </Link>

          {!isAuthorized && (
            <p className="text-sm text-gray-600 mt-4">
              Back to{" "}
              <Link
                to="/login"
                className="font-medium text-black hover:underline"
              >
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
