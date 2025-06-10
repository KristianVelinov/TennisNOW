import React, { useEffect, useState } from "react";
import { getProfileStats } from "../services/api";
import { useNavigate } from "react-router";

export default function ProfileStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        setError("Failed to load your profile stats.");
      }
    };

    fetchStats();
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 border rounded-lg shadow bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-800">Your Profile Stats</h1>
      
      {error && <p className="text-red-600 text-center">{error}</p>}
      {!error && stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 border rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Total Reservations</h2>
              <p className="text-2xl text-center">{stats.total_reservations}</p>
            </div>

            <div className="p-4 border rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Total Reviews Given</h2>
              <p className="text-2xl text-center">{stats.total_reviews}</p>
            </div>

            <div className="p-4 border rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Average Rating</h2>
              <p className="text-2xl text-center">
                {stats.average_rating !== null ? stats.average_rating : "N/A"}
              </p>
            </div>
          </div>

          <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-lg font-semibold mb-3">Next Reservation</h2>
            {stats.next_reservation ? (
              <div className="space-y-1">
                <p><strong>Court:</strong> {stats.next_reservation.court_number}</p>
                <p><strong>Start:</strong> {new Date(stats.next_reservation.start_time).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(stats.next_reservation.end_time).toLocaleString()}</p>
              </div>
            ) : (
              <p>You don't have any upcoming reservations right now.</p>
            )}
          </div>

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>Thank you for staying active on our courts!</p>
          </div>
        </div>
      ) : !error ? (
        <p className="text-center text-gray-600">Loading your stats...</p>
      ) : null}
    </div>
  );
}
