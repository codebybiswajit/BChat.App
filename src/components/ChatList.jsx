import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChats, setSelectedChat, accessChat } from '../redux/slices/chatSlice';
import GroupChatModal from './GroupChatModal';
import { userService } from '../services/user.service';
import Avatar from './Avatar';

function ChatList() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { chats, selectedChat, isLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const data = await userService.searchUsers(query);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = async (userId) => {
    await dispatch(accessChat(userId));
    setSearchQuery('');
    setSearchResults([]);
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    return chat.users[0]._id === user._id ? chat.users[1].name : chat.users[0].name;
  };

  return (
    <>
      <div className={`w-full md:w-1/3 ${selectedChat ? 'hidden md:flex' : 'flex'} flex-col border-r dark:border-gray-700 bg-white dark:bg-gray-800 h-full overflow-hidden transition-colors duration-300`}>
        <div className="p-4 bg-indigo-50 dark:bg-gray-900 border-b dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Chats</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-3 py-1 text-sm rounded-full hover:bg-indigo-700"
            title="Create Group"
          >
            + Group
          </button>
        </div>

      {/* Search Bar */}
      <div className="p-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 relative">
        <input
          type="text"
          placeholder="Search users to chat..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
        />
        
        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">Searching...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => (
                <div 
                  key={u._id} 
                  onClick={() => startChat(u._id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b dark:border-gray-700 last:border-0"
                >
                  <Avatar src={u.avatar} name={u.name} size="w-8 h-8" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">No users found</p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Loading chats...</p>
        ) : chats?.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => dispatch(setSelectedChat(chat))}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedChat?._id === chat._id ? 'bg-indigo-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
            >
              <p className="font-medium">{getChatName(chat)}</p>
              {chat.latestMessage && (
                <p className={`text-sm truncate ${selectedChat?._id === chat._id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {chat.latestMessage.sender.name}: {chat.latestMessage.content}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No chats yet.</p>
        )}
      </div>
      </div>
      <GroupChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default ChatList;
