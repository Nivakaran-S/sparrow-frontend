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

interface TrackShipmentsProps {
  setActiveTab?: (tab: string) => void;
}

export default function SwiftScreen({ setActiveTab }: TrackShipmentsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sessionsRef = useRef<Session[]>([]);
  const activeSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

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

    const defaultSession: Session = {
      id: uuidv4(),
      title: 'New Chat',
      thread_id: null,
      messages: [
        {
          type: 'receiver',
          content: "Hi there! I'm Swift, your virtual assistant. How can I help you today?",
          timestamp: Date.now(),
        },
      ],
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save sessions to localStorage', err);
    }
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, typing]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const sendMessageAPI = async (txt: string, thread_id: string | null) => {
    try {
      const payload: any = { message: txt };
      if (thread_id) payload.thread_id = thread_id;

      const resp = await axios.post(API_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 100000,
      });

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

  const handleSendMessage = async () => {
    const sid = activeSessionIdRef.current;
    if (!sid || !message.trim() || isSending) return;

    const currentSession = sessionsRef.current.find((s) => s.id === sid);
    const threadId = currentSession?.thread_id ?? null;

    const text = message.trim();
    const senderMsg: Message = { type: 'sender', content: text, timestamp: Date.now() };

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

  const createNewSession = () => {
    const newSession: Session = {
      id: uuidv4(),
      title: `Chat ${sessions.length + 1}`,
      thread_id: null,
      messages: [
        {
          type: 'receiver',
          content: 'New chat started! How can I help you?',
          timestamp: Date.now(),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSidebarOpen(false);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    <div className="text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Swift Assistant</h2>
          <p className="text-gray-400">Your AI-powered shipping assistant</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-4 py-2 cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
        >
          {sidebarOpen ? '✕ Close' : 'Sessions'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-[280px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-4 flex flex-col h-[calc(100vh-250px)]">
            <button
              onClick={createNewSession}
              className="w-full cursor-pointer mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all font-medium"
            >
              + New Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setSidebarOpen(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeSessionId === s.id
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate text-sm">{s.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.id);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  {s.thread_id && (
                    <span className="text-xs text-gray-500 mt-1 block">
                      Thread active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 flex flex-col h-[calc(100vh-250px)]">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeSession && activeSession.messages.length > 0 ? (
              activeSession.messages
                .slice()
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.type === 'sender' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.type === 'sender'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/50 border border-gray-600 text-gray-100'
                      }`}
                    >
                      {parseMessageToJSX(msg.content)}
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <div className="text-center">
                  
                  <p className="text-lg">Start a conversation with Swift</p>
                  <p className="text-sm mt-2">Ask anything about your shipments</p>
                </div>
              </div>
            )}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-700/50 border border-gray-600 px-4 py-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="relative flex items-center gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-gray-900 text-white p-3 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                rows={1}
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                className={`absolute right-2 p-2 rounded-lg transition-all ${
                  isSending || !message.trim()
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-blue-600 cursor-pointer'
                }`}
              >
                <Image alt="send" src={Send} height={20} width={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}