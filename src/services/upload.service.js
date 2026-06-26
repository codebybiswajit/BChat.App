import api from './api';

const uploadMedia = async (formData) => {
  const response = await api.post('/upload', formData);
  return response.data;
};

export const uploadService = {
  uploadMedia,
};
