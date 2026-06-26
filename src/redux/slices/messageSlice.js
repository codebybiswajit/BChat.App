import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../services/message.service';

const initialState = {
  messages: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const getAuthHeaders = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchMessages = createAsyncThunk('message/fetchMessages',  async (chatId, thunkAPI) => {
    try {
      return await messageService.fetchMessages(chatId);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendMessage = createAsyncThunk('message/sendMessage',  async (messageData, thunkAPI) => {
    try {
      return await messageService.sendMessage(messageData);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const editMessageThunk = createAsyncThunk('message/editMessage',  async ({ messageId, content }, thunkAPI) => {
    try {
      return await messageService.editMessage(messageId, content);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteMessageThunk = createAsyncThunk('message/deleteMessage',  async (messageId, thunkAPI) => {
    try {
      return await messageService.deleteMessage(messageId);
    } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessageLocally: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageLocally: (state, action) => {
      state.messages = state.messages.map(m => m._id === action.payload._id ? action.payload : m);
    },
    resetMessageState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        // optionally show a subtle loading state for sending
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        state.messages = state.messages.map(m => m._id === action.payload._id ? action.payload : m);
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        state.messages = state.messages.map(m => m._id === action.payload._id ? action.payload : m);
      });
  },
});

export const { addMessageLocally, updateMessageLocally, resetMessageState } = messageSlice.actions;
export default messageSlice.reducer;
