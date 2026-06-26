import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedChat } from '../redux/slices/chatSlice';
import { fetchMessages, sendMessage, addMessageLocally, updateMessageLocally, editMessageThunk, deleteMessageThunk } from '../redux/slices/messageSlice';
import axios from 'axios';
import { uploadService } from '../services/upload.service';
import io from 'socket.io-client';
import Avatar from './Avatar';

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
let socket, selectedChatCompare;

function ChatWindow() {
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { messages, isLoading } = useSelector((state) => state.message);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessages(selectedChat._id));
      socket.emit('join chat', selectedChat._id);
    }
    selectedChatCompare = selectedChat;
  }, [selectedChat, dispatch]);

  useEffect(() => {
    socket.on('message recieved', (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // give notification (future phase)
      } else {
        dispatch(addMessageLocally(newMessageRecieved));
      }
    });
    
    socket.on('message updated', (updatedMessage) => {
      if (selectedChatCompare && selectedChatCompare._id === updatedMessage.chat._id) {
        dispatch(updateMessageLocally(updatedMessage));
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      const messageData = { content: newMessage, chatId: selectedChat._id };
      setNewMessage('');
      
      const res = await dispatch(sendMessage(messageData));
      if (!res.error) {
        socket.emit('new message', res.payload);
      }
    }
  };

  if (!selectedChat) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 h-full transition-colors duration-300">
        <h2 className="text-2xl text-gray-400 dark:text-gray-500 font-light">Select a chat to start messaging</h2>
      </div>
    );
  }

  const chatName = selectedChat.isGroupChat
    ? selectedChat.chatName
    : selectedChat.users[0]._id === user._id
    ? selectedChat.users[1].name
    : selectedChat.users[0].name;

  return (
    <div className={`flex-1 w-full md:w-2/3 ${selectedChat ? 'flex' : 'hidden md:flex'} flex-col h-full bg-[#efeae2] dark:bg-gray-900 transition-colors duration-300`}>
      {/* Chat Header */}
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 border-b dark:border-gray-700 flex justify-between items-center shadow-sm z-10 transition-colors duration-300">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => dispatch(setSelectedChat(null))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <Avatar src={selectedChat.isGroupChat ? null : selectedChat.users.find(u => u._id !== user._id)?.avatar} name={chatName} size="w-10 h-10" className="mr-4 border dark:border-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{chatName}</h3>
            {isTyping && <span className="text-xs text-green-500 italic">Typing...</span>}
          </div>
        </div>

        {/* Video Call Button (only for 1-on-1 chats) */}
        {!selectedChat.isGroupChat && (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('initiate-call'))}
            className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600 transition-colors"
            title="Video Call"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Window */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center mt-10"><span className="text-gray-500">Loading messages...</span></div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages && messages.map((m) => (
              <div
                key={m._id}
                className={`max-w-[70%] p-3 rounded-lg shadow-sm relative group ${
                  m.sender._id === user._id
                    ? 'bg-[#d9fdd3] dark:bg-indigo-900 self-end rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 self-start rounded-tl-none'
                }`}
              >
                {selectedChat.isGroupChat && m.sender._id !== user._id && (
                  <p className="text-xs text-indigo-500 font-medium mb-1">{m.sender.name}</p>
                )}
                
                {m.mediaUrl ? (
                  <div className="mt-2 mb-2">
                    {m.mediaType === 'image' ? (
                      <img src={m.mediaUrl} alt="uploaded media" className="max-w-[200px] rounded" />
                    ) : (
                      <video src={m.mediaUrl} controls className="max-w-[200px] rounded" />
                    )}
                  </div>
                ) : null}
                
                {editingMessageId === m._id && !m.mediaUrl ? (
                  <div className="flex gap-2">
                    <input 
                      className="text-sm px-2 py-1 rounded border outline-none w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                      onClick={async () => {
                        const res = await dispatch(editMessageThunk({ messageId: m._id, content: editContent }));
                        if(!res.error) socket.emit('message edited', res.payload);
                        setEditingMessageId(null);
                      }}
                    >Save</button>
                    <button className="text-xs bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditingMessageId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    {m.content && <p className={`text-gray-800 dark:text-gray-100 ${m.isDeleted ? 'italic text-gray-500 dark:text-gray-400' : ''}`}>{m.content}</p>}
                    <p className="text-[10px] text-gray-400 dark:text-gray-400/80 text-right mt-1 flex justify-end gap-1 items-center">
                      {m.isEdited && !m.isDeleted && <span className="italic mr-1">Edited</span>}
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </>
                )}

                {/* Edit/Delete Menu (only for sender and if not deleted) */}
                {m.sender._id === user._id && !m.isDeleted && editingMessageId !== m._id && (
                  <div className="absolute top-1 right-1 hidden group-hover:flex gap-1 bg-white shadow rounded px-1">
                    {!m.mediaUrl && (
                      <button 
                        className="text-xs text-blue-500 hover:text-blue-700 p-1"
                        onClick={() => { setEditingMessageId(m._id); setEditContent(m.content); }}
                      >Edit</button>
                    )}
                    <button 
                      className="text-xs text-red-500 hover:text-red-700 p-1"
                      onClick={async () => {
                        const res = await dispatch(deleteMessageThunk(m._id));
                        if(!res.error) socket.emit('message deleted', res.payload);
                      }}
                    >Del</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t dark:border-gray-700 flex items-center gap-2 transition-colors duration-300">
        <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          <input type="file" className="hidden" onChange={async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const formData = new FormData();
            formData.append('media', file);
            
            try {
              const data = await uploadService.uploadMedia(formData);
              
              const messageData = { content: '', chatId: selectedChat._id, mediaUrl: data.url, mediaType: data.type };
              const res = await dispatch(sendMessage(messageData));
              if(!res.error) {
                socket.emit('new message', res.payload);
              }
            } catch(error) {
              console.error(error);
            }
          }} />
        </label>
        <input
          type="text"
          className="flex-1 border-0 rounded-full py-3 px-6 bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 transition-colors"
          placeholder="Type a message..."
          value={newMessage}
          onChange={typingHandler}
          onKeyDown={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default ChatWindow;
