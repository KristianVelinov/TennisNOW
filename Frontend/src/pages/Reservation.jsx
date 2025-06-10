import React, { useState, useEffect } from "react";
import { getMyReservations, deleteReservation } from "../services/api";
import { Link, useLocation } from 'react-router'

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");
  const [ratedReservations, setRatedReservations] = useState({});
  const [now, setNow] = useState(new Date());
  const courts = [1, 2, 3, 4, 5, 6];
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000); // update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const expiredReservations = React.useMemo(() => {
    return reservations.filter(r => new Date(r.end_time) < now);
  }, [reservations, now]);

  const activeReservations = React.useMemo(() => {
    return reservations.filter(r => new Date(r.end_time) >= now);
  }, [reservations, now]);

  useEffect(() => {
    fetchUserReservations();
  }, []);

  useEffect(() => {
    setMessage("");
  }, [selectedDate]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchUserReservations();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (expiredReservations.length === 0) return;

    async function fetchRatingsStatus() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const statusObj = {};
      for (const r of expiredReservations) {
        try {
          const res = await checkIfRated(token, r.id);
          statusObj[r.id] = res.has_rated;
        } catch {
          statusObj[r.id] = false;
        }
      }
      setRatedReservations(statusObj);
    }

    fetchRatingsStatus();
  }, [expiredReservations]);

  const fetchUserReservations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setReservations([]);
      setMessage("Please log in to see your reservations.");
      return;
    }
    try {
      const data = await getMyReservations(token);
      if (Array.isArray(data)) {
        setReservations(data);
        setMessage("");
      } else {
        setReservations([]);
        setMessage("Failed to fetch your reservations.");
      }
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      setReservations([]);
      setMessage("Failed to fetch your reservations.");
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reservation? Deleting this reservation will also remove it from your history and stats.");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to delete a reservation.");
      return;
    }

    try {
      const result = await deleteReservation(token, reservationId);
      if (result.message === "Reservation deleted") {
        setReservations(reservations.filter(r => r.id !== reservationId));
        setMessage("Reservation deleted successfully.");
      } else {
        setMessage(result.message || "Failed to delete reservation.");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      setMessage("Failed to delete reservation.");
    }
  };

  const isSlotReserved = (court, hour) => {
    return reservations.some((r) => {
      if (r.court_number !== court) return false;
      const resStart = new Date(r.start_time);
      const resEnd = new Date(r.end_time);
      const slotStart = new Date(`${selectedDate}T${String(hour).padStart(2, "0")}:00:00`);
      return (
        slotStart >= resStart &&
        slotStart < resEnd &&
        resStart.toISOString().startsWith(selectedDate)
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Court Reservations</h1>

      <div className="mb-6">
        <label className="font-semibold mr-2">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Court</th>
              {timeSlots.map((hour) => (
                <th key={hour} className="border px-2 py-1 text-sm">{hour}:00</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court}>
                <td className="border px-4 py-2 font-semibold text-center">Court {court}</td>
                {timeSlots.map((hour) => (
                  <td
                    key={hour}
                    className={`border text-center select-none ${isSlotReserved(court, hour)
                      ? "bg-red-700 text-white"
                      : "bg-white"
                      }`}
                  >
                    {isSlotReserved(court, hour) ? "B" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Your Active Reservations</h2>
        {activeReservations.length === 0 ? (
          <p>No active reservations found.</p>
        ) : (
          <ul className="space-y-2">
            {activeReservations
              .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
              .map((reservation) => (
                <li key={reservation.id} className="flex items-center justify-between bg-green-100 p-3 rounded">
                  <span>
                    Court {reservation.court_number} | {new Date(reservation.start_time).toLocaleString()} - {new Date(reservation.end_time).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDeleteReservation(reservation.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Expired (Archived) Reservations</h2>
        {expiredReservations.length === 0 ? (
          <p>No expired reservations found.</p>
        ) : (
          <ul className="space-y-2">
            {expiredReservations
              .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
              .map((reservation) => (
                <li
                  key={reservation.id}
                  className="flex items-center justify-between bg-gray-200 p-3 rounded"
                >
                  <span>
                    Court {reservation.court_number} |{" "}
                    {new Date(reservation.start_time).toLocaleString()} -{" "}
                    {new Date(reservation.end_time).toLocaleString()}
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteReservation(reservation.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>

                    {ratedReservations[reservation.id] ? (
                      <button
                        disabled
                        className="bg-gray-400 cursor-not-allowed text-white px-3 py-1 rounded"
                        title="You have already rated this reservation"
                      >
                        Rated
                      </button>
                    ) : (
                      <Link
                        to={`/rate/${reservation.id}`}
                        className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {message && <p className="text-center text-red-600 mb-6">{message}</p>}
    </div>
  );
}

export default Reservations;
