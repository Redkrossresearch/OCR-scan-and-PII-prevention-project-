import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex justify-between items-center">

      <div>
        <h1 className="text-white text-3xl font-bold">
          AI Data Security Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white">
          <span className="text-2xl">👤</span>
          <span>{user?.email || 'Admin'}</span>
        </div>
        <button onClick={handleLogout}
          className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
          Logout
        </button>
      </div>

    </div>
  );
}

export default Navbar;
