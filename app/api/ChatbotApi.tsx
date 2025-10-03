"use client";

import axios from "axios";

const API_BASE_URL = "http://localhost:8088";

export interface ChatResponse {
  success: boolean;
  response?: string;
  status?: string;
  thread_id?: string;
  error?: string;
}

export interface NewConversationResponse {
  success: boolean;
  message: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  active_conversations: number;
}

/**
 * Send a chat message to the backend
 */
export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const res = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
      message,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Start a new conversation thread
 */
export async function startNewConversation(): Promise<NewConversationResponse> {
  try {
    const res = await axios.post<NewConversationResponse>(
      `${API_BASE_URL}/new_conversation`
    );
    return res.data;
  } catch (error: any) {
    console.error("Error starting new conversation:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Check health of the Chat API
 */
export async function checkHealth(): Promise<HealthResponse | { error: string }> {
  try {
    const res = await axios.get<HealthResponse>(`${API_BASE_URL}/health`);
    return res.data;
  } catch (error: any) {
    console.error("Error checking health:", error);
    return { error: error.message };
  }
}
