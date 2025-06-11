import { Link, useNavigate } from "react-router";

export default function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout(false);
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-red-800 text-white shadow">
      <h1 className="text-2xl font-bold tracking-wide">Court Reservations</h1>
      <nav className="space-x-6 text-lg">
        {!isLoggedIn ? (
          <Link to="/login" className="hover:text-blue-300 transition">
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="hover:text-blue-300 transition"
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            Logout
          </button>
        )}
        <Link to="/" className="hover:bg-red-50 bg-white text-red-800 p-1.5 rounded-md transition">Main</Link>
        <Link to="/reservations" className="hover:text-blue-300 transition">My Reservations</Link>
        <Link to="/book" className="hover:text-blue-300 transition">Book a Court</Link>
        <Link to="/stats" className="hover:text-blue-300 transition">Profile Stats</Link>
      </nav>
    </header>
  );
}
