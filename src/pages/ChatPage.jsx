import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CallWindow from '../components/CallWindow';

function ChatPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {user && <CallWindow />}
      {user && <ChatList />}
      {user && <ChatWindow />}
    </div>
  );
}

export default ChatPage;
