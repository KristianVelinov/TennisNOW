import React from "react";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-lg shadow">
      <h1 className="text-3xl mb-6 text-center">Welcome to the Dashboard </h1>
      <p className="text-center text-lg">You are now logged in.</p>
      <button
        onClick={handleLogout}
        className="block mx-auto mt-8 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
      >
        Log out
      </button>
    </div>
  );
};

export default Dashboard;
