import api from './api';

const fetchMessages = async (chatId) => {
  const response = await api.get(`/message/${chatId}`);
  return response.data;
};

const sendMessage = async (messageData) => {
  const response = await api.post('/message', messageData);
  return response.data;
};

const editMessage = async (messageId, content) => {
  const response = await api.put(`/message/${messageId}`, { content });
  return response.data;
};

const deleteMessage = async (messageId) => {
  const response = await api.delete(`/message/${messageId}`);
  return response.data;
};

export const messageService = {
  fetchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
};
