import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getProfileStats } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await getProfileStats(token);
        if (response.message) {
          setError(response.message);
        } else {
          setStats(response);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stats.");
      }
    };

    fetchStats();
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-lg shadow">
      <h1 className="text-3xl mb-6 text-center">Welcome to the Dashboard</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!error && stats ? (
        <div className="space-y-4">
          <p className="text-lg">Total Reservations: <strong>{stats.total_reservations}</strong></p>
          <p className="text-lg">Total Reviews: <strong>{stats.total_reviews}</strong></p>
          <p className="text-lg">Average Rating: <strong>{stats.average_rating !== null ? stats.average_rating : "N/A"}</strong></p>
          {stats.next_reservation ? (
            <div className="border p-3 rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-1">Next Reservation</h2>
              <p>Court: {stats.next_reservation.court_number}</p>
              <p>Start: {new Date(stats.next_reservation.start_time).toLocaleString()}</p>
              <p>End: {new Date(stats.next_reservation.end_time).toLocaleString()}</p>
            </div>
          ) : (
            <p>No upcoming reservations.</p>
          )}
        </div>
      ) : !error ? (
        <p className="text-center">Loading your stats...</p>
      ) : null}

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
