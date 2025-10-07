'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import Send from '../../images/send.png';

type Message = {
  type: 'sender' | 'receiver';
  content: string;
  timestamp: number;
};

type Session = {
  id: string;
  title: string;
  thread_id: string | null;
  messages: Message[];
};

const STORAGE_KEY = 'swift_sessions_v1';
const API_URL = 'https://nivakaran-sparrowagenticai.hf.space/chat';

export default function SwiftScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Refs to prevent stale closures
  const sessionsRef = useRef<Session[]>([]);
  const activeSessionIdRef = useRef<string | null>(null);

  // Keep refs in sync
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Session[] = JSON.parse(raw);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to parse sessions from localStorage', err);
    }

    // Default session
    const defaultSession: Session = {
      id: uuidv4(),
      title: 'Default Session',
      thread_id: null,
      messages: [
        {
          type: 'receiver',
          content: "👋 Hi there! I'm Swift, your virtual assistant. How can I help you today?",
          timestamp: Date.now(),
        },
      ],
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  // Save sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save sessions to localStorage', err);
    }
  }, [sessions]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, typing]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // API call helper
  const sendMessageAPI = async (txt: string, thread_id: string | null) => {
    try {
      const payload: any = { message: txt };
      if (thread_id) payload.thread_id = thread_id;

      console.log('Sending to API:', payload);
      const resp = await axios.post(API_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 100000,
      });

      console.log('API response raw:', resp.data);
      const data = resp.data;

      if (data && data.success) {
        return {
          success: true,
          response: data.response,
          thread_id: data.thread_id ?? null,
        };
      }

      return { success: false, error: data?.error ?? 'Unknown error from API' };
    } catch (err: any) {
      console.error('sendMessageAPI error:', err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.statusText ||
        err?.message ||
        'Network / API error';
      return { success: false, error: errMsg };
    }
  };

  // Send message
  const handleSendMessage = async () => {
    const sid = activeSessionIdRef.current;
    if (!sid) return;
    if (!message.trim()) return;
    if (isSending) return;

    const currentSession = sessionsRef.current.find((s) => s.id === sid);
    const threadId = currentSession?.thread_id ?? null;

    const text = message.trim();
    const senderMsg: Message = { type: 'sender', content: text, timestamp: Date.now() };

    // Add sender message
    setSessions((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, messages: [...s.messages, senderMsg] } : s))
    );

    setMessage('');
    setIsSending(true);
    setTyping(true);

    const result = await sendMessageAPI(text, threadId);

    setIsSending(false);
    setTyping(false);

    if (result.success) {
      const receiverMsg: Message = {
        type: 'receiver',
        content: result.response ?? 'No response received',
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sid) return s;

          // ✅ Only set thread_id if none existed before
          const updatedThreadId = s.thread_id ?? result.thread_id ?? null;

          return {
            ...s,
            messages: [...s.messages, receiverMsg],
            thread_id: updatedThreadId,
          };
        })
      );
    } else {
      const errMsg: Message = {
        type: 'receiver',
        content: `Error: ${result.error ?? 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sid ? { ...s, messages: [...s.messages, errMsg] } : s
        )
      );
    }
  };

  // Create session
  const createNewSession = () => {
    const newSession: Session = {
      id: uuidv4(),
      title: `Chat ${sessions.length + 1}`,
      thread_id: null,
      messages: [
        {
          type: 'receiver',
          content: '🧠 New chat started! How can I help you?',
          timestamp: Date.now(),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete session
  const deleteSession = (id: string) => {
    if (sessionsRef.current.length <= 1) {
      alert('You must keep at least one session.');
      return;
    }

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSessionIdRef.current === id) {
        const next = filtered[0];
        setActiveSessionId(next?.id ?? null);
      }
      return filtered;
    });
  };

  // Enter sends
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Parse **bold**
  const parseMessageToJSX = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={idx}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  return (
    <div className="flex h-[81vh] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[300px] bg-[#101010] border-r border-gray-700 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Sessions</h2>
          <button
            onClick={createNewSession}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                activeSessionId === s.id ? 'bg-gray-600' : 'hover:bg-gray-700'
              }`}
            >
              <div className="truncate">{s.title}</div>
              <div className="flex items-center gap-2">
                {s.thread_id && (
                  <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
                    tid
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  className="text-red-400 hover:text-red-500 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-[#111] border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{activeSession?.title ?? 'Swift Chat'}</h2>
          <div className="text-sm text-gray-400">
            {activeSession?.thread_id ? `thread: ${activeSession.thread_id}` : ''}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-[#101010] custom-scrollbar">
          {activeSession && activeSession.messages.length > 0 ? (
            activeSession.messages
              .slice()
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.type === 'sender' ? 'justify-end' : 'justify-start'
                  } mb-3`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      msg.type === 'sender'
                        ? 'bg-gray-500 text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    {parseMessageToJSX(msg.content)}
                  </div>
                </div>
              ))
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Start a conversation...
            </div>
          )}

          {typing && (
            <div className="flex justify-start mb-2">
              <div className="bg-white text-black px-3 py-2 rounded-lg text-sm">
                Typing...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#000] border-t border-gray-700 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Swift..."
            className="w-full bg-[#111] text-white p-3 rounded-lg resize-none focus:outline-none h-[80px]"
            disabled={isSending}
          />
          <div
            onClick={handleSendMessage}
            className={`absolute right-6 bottom-6 cursor-pointer rounded-full p-3 ${
              isSending
                ? 'opacity-60 pointer-events-none'
                : 'bg-[#373435] hover:bg-[#555]'
            }`}
            title={isSending ? 'Sending...' : 'Send'}
          >
            <Image alt="send" src={Send} height={25} />
          </div>
        </div>
      </div>
    </div>
  );
}
