import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import { logout, reset } from './redux/slices/authSlice';
import ThemeToggle from './components/ThemeToggle';
import Avatar from './components/Avatar';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
        <header className="bg-indigo-600 dark:bg-gray-800 text-white p-4 shadow-md flex justify-between items-center h-16 transition-colors duration-300 border-b border-transparent dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img src="/logo192.png" alt="BChat Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-bold tracking-wider">BChat</h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2">
                <Avatar src={user.avatar} name={user.name} size="w-8 h-8" className="border-2 border-white dark:border-gray-700" />
                <span className="font-medium hidden sm:block">{user.name}</span>
              </div>
              <button 
                onClick={onLogout}
                className="bg-indigo-500 dark:bg-gray-700 hover:bg-indigo-400 dark:hover:bg-gray-600 text-sm px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </header>
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/chat" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/chat" />} />
            <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
