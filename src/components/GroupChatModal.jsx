import { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { userService } from '../services/user.service';
import { createGroupChat } from '../redux/slices/chatSlice';
import Avatar from './Avatar';

function GroupChatModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await userService.searchUsers(query);
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) return;
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupChatName || !selectedUsers.length) {
      alert("Please fill all the fields");
      return;
    }

    const groupData = {
      name: groupChatName,
      users: JSON.stringify(selectedUsers.map((u) => u._id)),
    };

    dispatch(createGroupChat(groupData));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Create Group Chat</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Chat Name"
            className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Add Users (eg: John, Jane)"
            className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {/* Selected Users */}
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((u) => (
              <span key={u._id} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded flex items-center gap-1">
                {u.name}
                <button type="button" onClick={() => handleDelete(u)} className="text-red-500 hover:text-red-700 font-bold ml-1">x</button>
              </span>
            ))}
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {searchResults?.slice(0, 4).map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleGroup(user)}
                  className="p-2 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-800 dark:text-gray-200"
                >
                  <Avatar src={user.avatar} name={user.name} size="w-6 h-6" />
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupChatModal;
