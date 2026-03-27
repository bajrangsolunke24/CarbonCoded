import api from './api';

export async function createSession(): Promise<string> {
  const res = await api.post('/chatbot/session');
  return res.data.session_token;
}

export async function sendMessage(session_token: string, message: string): Promise<string> {
  const res = await api.post('/chatbot/message', { session_token, message });
  return res.data.reply;
}

export async function getFaqs(): Promise<Array<{ q: string; a: string }>> {
  const res = await api.get('/chatbot/faqs');
  return res.data;
}
