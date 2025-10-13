'use client';
import React, { useEffect, useRef, useState, JSX } from 'react';
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

  const parseMarkdownToJSX = (text: string) => {
    // Split by code blocks and tables
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;

    // First, handle code blocks
    const textWithCodePlaceholders = text.replace(codeBlockRegex, (match, lang, code, offset) => {
      const placeholder = `__CODE_BLOCK_${offset}__`;
      parts.push(
        <div key={`code-${offset}`} className="my-3">
          <div className="bg-gray-900 rounded-t-lg px-3 py-1 text-xs text-gray-400 border-b border-gray-700">
            {lang || 'code'}
          </div>
          <pre className="bg-gray-950 p-3 rounded-b-lg overflow-x-auto">
            <code className="text-sm text-gray-200 font-mono">{code}</code>
          </pre>
        </div>
      );
      return placeholder;
    });

    // Parse the remaining content with tables
    return <div>{parseContentWithTables(textWithCodePlaceholders, parts)}</div>;
  };

  const parseContentWithTables = (text: string, codeParts: JSX.Element[]) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check for code block placeholder
      if (line.includes('__CODE_BLOCK_')) {
        const match = line.match(/__CODE_BLOCK_(\d+)__/);
        if (match) {
          const offset = parseInt(match[1]);
          const codePart = codeParts.find(p => p.key === `code-${offset}`);
          if (codePart) {
            elements.push(codePart);
          }
        }
        i++;
        continue;
      }

      // Check if this line starts a table
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
        // Parse table
        const tableLines: string[] = [line];
        let j = i + 1;
        
        // Collect all table lines
        while (j < lines.length && lines[j].includes('|')) {
          tableLines.push(lines[j]);
          j++;
        }

        const table = parseTable(tableLines, i);
        if (table) elements.push(table);
        i = j;
      } else {
        // Regular content
        elements.push(
          <span key={`content-${i}`}>
            {parseInlineMarkdown(line)}
          </span>
        );
        i++;
      }
    }

    return elements;
  };

  const parseTable = (tableLines: string[], startIdx: number) => {
    if (tableLines.length < 2) return null;

    // Parse header
    const headerCells = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    
    // Skip separator line (line with dashes)
    // Parse body rows
    const bodyRows = tableLines.slice(2).map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    return (
      <div key={`table-${startIdx}`} className="my-4 overflow-x-auto">
        <table className="w-full border-collapse bg-gray-900/50 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800">
              {headerCells.map((cell, idx) => (
                <th key={idx} className="px-4 py-3 text-left font-semibold text-gray-200 border-b border-gray-700">
                  {parseInlineFormatting(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-gray-300">
                    {parseInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseInlineMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, lineIdx) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${lineIdx}`} className="text-lg font-bold mt-4 mb-2">
            {parseInlineFormatting(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${lineIdx}`} className="text-xl font-bold mt-4 mb-2">
            {parseInlineFormatting(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${lineIdx}`} className="text-2xl font-bold mt-4 mb-2">
            {parseInlineFormatting(line.slice(2))}
          </h1>
        );
      }
      // Bullet lists
      else if (line.match(/^[\*\-]\s/)) {
        elements.push(
          <div key={`li-${lineIdx}`} className="flex gap-2 my-1 ml-4">
            <span className="text-gray-400">•</span>
            <span>{parseInlineFormatting(line.slice(2))}</span>
          </div>
        );
      }
      // Numbered lists
      else if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\.\s/)?.[1];
        elements.push(
          <div key={`ol-${lineIdx}`} className="flex gap-2 my-1 ml-4">
            <span className="text-gray-400">{num}.</span>
            <span>{parseInlineFormatting(line.slice(num!.length + 2))}</span>
          </div>
        );
      }
      // Regular paragraph
      else if (line.trim()) {
        elements.push(
          <p key={`p-${lineIdx}`} className="my-1">
            {parseInlineFormatting(line)}
          </p>
        );
      }
      // Empty line
      else {
        elements.push(<br key={`br-${lineIdx}`} />);
      }
    });

    return elements;
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, idx) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      // Italic
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
      }
      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Links
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
      
      return <span key={idx}>{part}</span>;
    });
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

      <div className="flex  gap-3">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-[280px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-4 flex flex-col h-[calc(100vh-220px)]">
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
                      className="text-red-400 cursor-pointer hover:text-red-300 ml-2"
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
        <div className="flex-1  bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 flex flex-col h-[calc(100vh-220px)]">
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
                      {parseMarkdownToJSX(msg.content)}
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
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