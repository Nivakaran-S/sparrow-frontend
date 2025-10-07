"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Menu, PlusCircle, Trash2 } from "lucide-react";

type Message = {
  sender: "user" | "swift";
  content: string;
};

type Session = {
  id: number;
  name: string;
  messages: Message[];
};

const LOCAL_STORAGE_KEY = "swift_sessions_v1";
const ACTIVE_SESSION_KEY = "swift_active_session";

const SwiftScreen = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const faqs = [
    {
      question: "How do I track my parcel?",
      answer:
        "Go to 'Track Shipment' and enter your tracking number. You'll see real-time updates on your parcel's location and status.",
    },
    {
      question: "How do I create a new shipment?",
      answer:
        "Navigate to 'Create Shipment', fill in the sender and receiver details, and submit. You'll receive a tracking number immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Visa, MasterCard, American Express, PayPal, and bank transfers for enterprise customers.",
    },
  ];

  // Load sessions from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedActive = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (storedSessions) {
      const parsed = JSON.parse(storedSessions);
      setSessions(parsed);
      if (storedActive) setActiveSession(Number(storedActive));
      else setActiveSession(parsed[0]?.id || null);
    } else {
      const defaultSession: Session = {
        id: Date.now(),
        name: "Default Session",
        messages: [
          {
            sender: "swift",
            content:
              "👋 Hi there! I'm Swift, your virtual assistant. How can I help you today?",
          },
        ],
      };
      setSessions([defaultSession]);
      setActiveSession(defaultSession.id);
    }
  }, []);

  // Save sessions and active session to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
      if (activeSession) {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSession.toString());
      }
    }
  }, [sessions, activeSession]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSession, isTyping]);

  const activeMessages =
    sessions.find((s) => s.id === activeSession)?.messages || [];

  const handleSend = () => {
    if (!input.trim() || !activeSession) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession
          ? { ...s, messages: [...s.messages, { sender: "user", content: input }] }
          : s
      )
    );

    const userInput = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const matchedFAQ = faqs.find((f) =>
        f.question.toLowerCase().includes(userInput.toLowerCase())
      );
      const swiftMessage = {
        sender: "swift" as const,
        content: matchedFAQ
          ? matchedFAQ.answer
          : "I'm not sure about that yet 🤔, but you can contact support at support@sparrow.com.",
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession
            ? { ...s, messages: [...s.messages, swiftMessage] }
            : s
        )
      );
      setIsTyping(false);
    }, 1000);
  };

  const handleNewSession = () => {
    const newId = Date.now();
    const newSession: Session = {
      id: newId,
      name: `Session ${sessions.length + 1}`,
      messages: [
        {
          sender: "swift",
          content: "🧠 New chat started! How can I help you?",
        },
      ],
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSession(newId);
  };

  const handleSwitchSession = (id: number) => {
    setActiveSession(id);
  };

  const handleDeleteSession = (id: number) => {
    if (sessions.length === 1) {
      alert("You must keep at least one session.");
      return;
    }

    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);

    if (activeSession === id) {
      setActiveSession(filtered[0].id);
    }
  };

  return (
    <div className="flex h-[80vh] w-full bg-[#0f172a] text-white border border-gray-700 shadow-xl overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 70 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1e293b] border-r border-gray-700 flex flex-col justify-between"
      >
        <div className="flex-1 p-3 overflow-y-auto">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 mb-4 hover:bg-gray-700 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {sidebarOpen ? (
            <div>
              <h2 className="text-lg font-bold mb-3">Sessions</h2>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg ${
                      s.id === activeSession
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchSession(s.id)}
                      className="flex-1 text-left truncate"
                    >
                      {s.name}
                    </button>

                    {sessions.length > 1 && (
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  title={s.name}
                  onClick={() => handleSwitchSession(s.id)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer ${
                    s.id === activeSession
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  M
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleNewSession}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 w-full px-3 py-2 rounded-lg font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            {sidebarOpen && "New Chat"}
          </button>
        </div>
      </motion.aside>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-[#1e293b] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Ask Swift</h2>
            <p className="text-gray-400 text-sm">
              Session: {sessions.find((s) => s.id === activeSession)?.name}
            </p>
          </div>
          <div className="text-2xl">⚡</div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {activeMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-2 rounded-2xl text-gray-400 text-sm animate-pulse">
                Swift is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#1e293b] border-t border-gray-700 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about shipping, tracking, or payments..."
            className="flex-1 bg-gray-800 text-gray-100 px-4 py-2 rounded-lg focus:outline-none border border-gray-700 focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwiftScreen;
