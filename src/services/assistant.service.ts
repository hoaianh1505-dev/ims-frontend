import { apiClient } from './api.client';

export interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export interface AssistantToolCall {
  name: string;
  args: any;
  result: any;
}

export interface AssistantChatResponse {
  reply: string;
  tool_calls?: AssistantToolCall[];
}

export const assistantService = {
  /**
   * Gửi câu hỏi đến Trợ lý AI (Stateless: truyền message và lịch sử nếu muốn)
   */
  chat: async (
    message: string,
    history?: ChatHistoryItem[]
  ): Promise<AssistantChatResponse> => {
    const res = await apiClient.post('/assistant/chat', { message, history });
    return res.data?.data || res.data;
  },
};

