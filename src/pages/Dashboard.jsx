import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Welcome, {user?.name}</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-lg mb-4">
            You are successfully logged in and authenticated via JWT.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Profile Details</h3>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?._id}</p>
            <p><strong>Status:</strong> {user?.status}</p>
          </div>
          
          <button 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
