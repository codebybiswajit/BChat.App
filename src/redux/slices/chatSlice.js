import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chat.service';

const initialState = {
  chats: [],
  selectedChat: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const getAuthHeaders = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, thunkAPI) => {
  try {
    return await chatService.fetchChats();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const accessChat = createAsyncThunk('chat/accessChat',  async (userId, thunkAPI) => {
    try {
      return await chatService.accessChat(userId);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createGroupChat = createAsyncThunk('chat/createGroup',  async (groupData, thunkAPI) => {
    try {
      return await chatService.createGroupChat(groupData);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const renameGroup = createAsyncThunk('chat/renameGroup',  async ({ chatId, chatName }, thunkAPI) => {
    try {
      return await chatService.renameGroupChat(chatId, chatName);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addMember = createAsyncThunk('chat/addMember',  async ({ chatId, userId }, thunkAPI) => {
    try {
      return await chatService.addToGroup(chatId, userId);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const removeMember = createAsyncThunk('chat/removeMember',  async ({ chatId, userId }, thunkAPI) => {
    try {
      return await chatService.removeFromGroup(chatId, userId);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(accessChat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(accessChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedChat = action.payload;
        if (!state.chats.find((c) => c._id === action.payload._id)) {
          state.chats = [action.payload, ...state.chats];
        }
      })
      .addCase(accessChat.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.chats = [action.payload, ...state.chats];
        state.selectedChat = action.payload;
      })
      .addCase(renameGroup.fulfilled, (state, action) => {
        state.selectedChat = action.payload;
        state.chats = state.chats.map(c => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.selectedChat = action.payload;
        state.chats = state.chats.map(c => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.selectedChat = action.payload;
        state.chats = state.chats.map(c => c._id === action.payload._id ? action.payload : c);
      });
  },
});

export const { setSelectedChat, resetChatState } = chatSlice.actions;
export default chatSlice.reducer;
