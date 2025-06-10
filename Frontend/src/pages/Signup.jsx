import React, { useState } from "react";
import { signup } from "../services/api";
import { useNavigate, Link } from "react-router";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(username, password, isAdmin ? adminPassword : null);
      console.log("Signup response:", response);
      if (response.message === "User created.") {
        navigate("/login");
      } else {
        setError(response.error || response.message || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Try again.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 p-6 border rounded-lg shadow">
      <h2 className="text-2xl mb-4 text-center">Sign Up</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <label>Register as Admin</label>
        </div>

        {isAdmin && (
          <input
            type="password"
            placeholder="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
