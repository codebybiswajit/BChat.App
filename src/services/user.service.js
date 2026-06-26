import api from './api';

const searchUsers = async (query) => {
  const response = await api.get(`/user?search=${query}`);
  return response.data;
};

export const userService = {
  searchUsers,
};
