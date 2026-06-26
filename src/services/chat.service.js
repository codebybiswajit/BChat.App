import api from './api';

const fetchChats = async () => {
  const response = await api.get('/chat');
  return response.data;
};

const accessChat = async (userId) => {
  const response = await api.post('/chat', { userId });
  return response.data;
};

const createGroupChat = async (groupData) => {
  const response = await api.post('/chat/group', groupData);
  return response.data;
};

const renameGroupChat = async (chatId, chatName) => {
  const response = await api.put('/chat/rename', { chatId, chatName });
  return response.data;
};

const addToGroup = async (chatId, userId) => {
  const response = await api.put('/chat/groupadd', { chatId, userId });
  return response.data;
};

const removeFromGroup = async (chatId, userId) => {
  const response = await api.put('/chat/groupremove', { chatId, userId });
  return response.data;
};

export const chatService = {
  fetchChats,
  accessChat,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};
