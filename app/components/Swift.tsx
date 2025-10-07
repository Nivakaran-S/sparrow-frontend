'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Send from '../images/send.png';
import { v4 as uuidv4 } from 'uuid';
import './Max.css';
  import axios from "axios";

type Message = {
  type: 'sender' | 'receiver';
  content: string;
  timestamp: number;
};

const Swift = () => {
  const [max, setMax] = useState(false);
  const [messageSubmitted, setMessageSubmitted] = useState(false);

  const [message, setMessage] = useState('');
  const [messageCollection, setMessageCollection] = useState<Message[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [typing, setTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

// ---- API FUNCTION ----
const sendMessage = async (message: string) => {
  try {
    const response = await axios.post(
      "https://nivakaran-sparrowagenticai.hf.space/chat",
      {
        message: message, // ✅ backend expects this key
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 100000,
      }
    );

    // ✅ Backend responds with JSON { success, response, thread_id }
    const data = response.data;
    if (data.success) {
      return {
        success: true,
        response: data.response,
        thread_id: data.thread_id,
      };
    } else {
      return { success: false, error: data.error || "Unknown error" };
    }
  } catch (error: any) {
    console.error("Error in sendMessage:", error);

    let errorMessage = "An unknown error occurred.";
    if (error.response) {
      errorMessage = `Server responded with status ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = "No response received from the server.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};


  // Manage thread ID (persist in localStorage)
  useEffect(() => {
    let storedThreadId = localStorage.getItem('threadId');
    if (!storedThreadId) {
      storedThreadId = uuidv4();
      localStorage.setItem('threadId', storedThreadId);
    }
    setThreadId(storedThreadId);
  }, []);

  // Auto scroll on new messages
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messageCollection]);

  const fetchData = async (msg: string) => {
    if (!msg.trim()) return;
    if (!threadId) return;

    try {
      setTyping(true);

      const res = await sendMessage(msg);

      if (res.success) {
        setThreadId(res.thread_id || threadId);
        localStorage.setItem("threadId", res.thread_id || threadId);

        const answer = res.response || "No response received";

        setMessageCollection((prevMessages) => [
          ...prevMessages,
          { type: "receiver", content: answer, timestamp: Date.now() }
        ]);
      } else {
        setMessageCollection((prevMessages) => [
          ...prevMessages,
          { type: "receiver", content: "Error: " + (res.error || "Unknown error"), timestamp: Date.now() }
        ]);
      }
    } catch (err: any) {
      console.error("Error invoking API: ", err);
      setMessageCollection((prevMessages) => [
        ...prevMessages,
        { type: "receiver", content: "An error occurred while contacting the chat API.", timestamp: Date.now() }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onMessageSubmit = (msg: string) => {
    if (msg.trim()) {
      setMessageSubmitted(true);

      setMessageCollection((prevMessages) => [
        ...prevMessages,
        { type: 'sender', content: msg, timestamp: Date.now() }
      ]);

      setMessage('');
      fetchData(msg);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onMessageSubmit(e.target.value);
    }
  };

  const handleMax = () => setMax(!max);
  const onMaxFalseClick = () => setMax(false);

  const parseMessageToJSX = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return <span className="flex" key={index}>{part}</span>;
    });
  };

  return (
    <div className={`${max ? 'h-[100vh] w-[100vw]' : ''} fixed z-[9999] text-black bottom-[0px] right-[0px]`}>
      <div
        onClick={onMaxFalseClick}
        className={`absolute top-0 left-0 w-screen h-screen bg-black transition-opacity duration-500 opacity-40 ${max ? 'flex' : 'hidden'}`}
      ></div>

      <div
        onClick={handleMax}
        className={`${max ? ' translate-y-[100px]' : 'translate-y-[0px] delay-300'} select-none transition-transform duration-500 ease-in-out absolute bottom-[20px] right-[30px] flex items-center justify-center w-fit bg-[#373435] ring-[0.5px] ring-[#727376] rounded-full cursor-pointer px-[30px] py-[5px]`}
      >
        <p className="select-none text-white text-[20px]">Swift</p>
      </div>

      <div
        className={`${max ? 'scale-[100%] delay-200' : 'scale-0'} custom-scrollbar absolute sm:bottom-[20px] sm:right-[30px] origin-bottom-right transition-transform duration-500 ease-in-out flex flex-col bg-[#373435] ring-[0.5px] ring-[#727376] h-[100vh] w-[100vw] sm:h-[580px] sm:w-[400px] sm:rounded-[10px] justify-center sm:mt-[5px]`}
      >
        <div className="w-[100%] pt-[15%] select-none px-[30px] sm:px-[20px] bg-[#000000] text-white flex flex-row justify-between sm:rounded-t-[10px] py-[15px] sm:py-[10px] h-fit items-center">
          <div>
            <p className="text-[30px] sm:text-[20px]">Swift</p>
          </div>
          <div onClick={handleMax} className="cursor-pointer">
            <p>Close</p>
          </div>
        </div>

        {messageSubmitted ? (
          <div
            className="flex flex-col h-[100%] overflow-y-auto py-4 ring-[1px] ring-[#373435] px-5 bg-[#101010] scrollbar scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800"
            ref={scrollContainerRef}
          >
            <div className="flex justify-center mt-[5px]">
              <div className="bg-[#8f8f8f] text-[12px] px-[8px] py-[2px] rounded-[5px] border-[1px] border-gray-500 box-shadow-lg w-fit">
                <p className="text-gray-800">Today</p>
              </div>
            </div>
            {messageCollection
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((msg, index) => (
                <div
                  className={`${msg.type === 'sender' ? 'justify-end' : 'justify-start'} flex`}
                  key={index}
                >
                  <div
                    className={`${msg.type === 'sender'
                        ? 'border-[1px] border-[#1D1D1D] self-end bg-[#808080] text-black'
                        : 'border-[1px] flex-col border-gray-500 self-start bg-white text-black'
                      } flex box-shadow-lg max-w-[80%] text-left mt-[10px] mx-[10px] rounded-[5px] py-[5px] px-[13px] text-[14px]`}
                  >
                    {parseMessageToJSX(msg.content)}
                  </div>
                </div>
              ))}
            {typing ? (
              <div className="flex h-[80px] py-[10px] justify-start mb-3 px-5">
                <div className="rounded-lg p-3 flex items-center">
                  <span className="loader"></span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className='h-[100%] sm:h-[430px] ring-[1px] ring-[#373435] flex flex-col justify-center items-center bg-[#101010]'>
            <div className="mx-[30px] text-gray-300 px-[10px] my-[20px] text-center">
              <p className="text-[15px]">Hello! I’m Swift, your AI-powered shipping assistant from Sparrow.</p>
              <p className="text-[15px]">
                I’m here to help you track parcels, explore our services, and find the best shipping
                solutions for your needs. Let’s make shipping simpler, faster, and smarter together!
              </p>
            </div>
          </div>
        )}

        <div className="w-[100%] ring-[1px] ring-[#373435] relative sm:rounded-b-[10px] py-[15px] px-[30px] sm:py-[10px] sm:px-[10px] h-[250px] sm:h-[190px] bg-[#000000]">
          <textarea
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="w-[100%] focus:outline-none h-[100%] leading-[19px] rounded-[5px] bg-[#101010] text-black py-[8px] px-[8px] bg-white resize-none"
            placeholder="Ask Swift"
          ></textarea>
          <div
            onClick={() => onMessageSubmit(message)}
            className="w-[70px] ring-[0.5px] ring-[#727376] cursor-pointer hover:bg-black absolute top-[15px] sm:top-[5px] right-[10px] sm:right-[-20px] h-[70px] rounded-full bg-[#373435] flex items-center justify-center mt-[10px]"
          >
            <Image alt="" className="ml-[7px]" src={Send} height={35} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swift;
