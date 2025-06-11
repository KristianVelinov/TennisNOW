import { Link, useNavigate } from "react-router";
import '../index.css';

export default function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout(false);
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-red-800 text-white shadow">
      <h1 className="text-2xl font-bold tracking-wide">TennisNOW</h1>
      <nav className="space-x-6 text-lg">
        {!isLoggedIn ? (
          <Link to="/login" className="hover:bg-red-50 inline-block bg-white text-red-800 p-1.5 rounded-md transform transition-transform duration-200 hover:scale-110">
            Login
          </Link>
        ) : (
          <Link
            onClick={handleLogout}
            className="hover:bg-red-50 inline-block bg-white text-red-800 p-1.5 rounded-md transform transition-transform duration-200 hover:scale-110"
          >
            Logout
          </Link>
        )}
        <Link to="/" className="hover:bg-red-50 inline-block bg-white text-red-800 p-1.5 rounded-md transform transition-transform duration-200 hover:scale-110">Main</Link>
        <Link to="/reservations" className="hover:bg-red-50 inline-block bg-white text-red-800 p-1.5 rounded-md transform transition-transform duration-200 hover:scale-110">My Reservations</Link>
        <Link to="/book" className="hover:bg-red-50 inline-block bg-white text-red-800 p-1.5 rounded-md transform transition-transform duration-200 hover:scale-110">Book a Court</Link>
        <Link to="/stats" className="hover:bg-red-50 inline-block bg-white text-red-800 p-1.5 rounded-md transform transition-transform duration-200 hover:scale-110">Profile Stats</Link>
      </nav>
    </header>
  );
}
