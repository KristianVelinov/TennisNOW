import React, { useState } from "react";
import { login } from "../services/api";
import { useNavigate, Link } from "react-router";

const Login = ({onLogin}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      if (response.token) {
        localStorage.setItem("token", response.token);
        onLogin(true);
        navigate("/");
      } else {
        setError(response.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Try again.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 p-6 border rounded-lg shadow">
      <h2 className="text-2xl mb-4 text-center">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
