import React, { useState, useEffect } from "react";
import axiosInstance from "../api";

function Reservations() {
  const [courtNumber, setCourtNumber] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [myReservations, setMyReservations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const response = await axiosInstance.get("/reservations/myreservations");
      setMyReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations", error);
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/reservations/book", {
        court_number: courtNumber,
        start_time: startTime,
        end_time: endTime,
      });

      setMessage("Reservation booked successfully!");
      fetchMyReservations();
    } catch (error) {
      console.error("Booking error:", error.response);
      if (error.response) {
        setMessage(error.response.data.message || "Booking failed.");
      } else {
        setMessage("Booking failed.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/reservations/delete/${id}`);
      setMessage("Reservation deleted successfully.");
      fetchMyReservations();
    } catch (error) {
      console.error("Delete error:", error.response);
      if (error.response) {
        setMessage(error.response.data.message || "Delete failed.");
      } else {
        setMessage("Delete failed.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Court Reservations</h1>

      <form onSubmit={handleReservation} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Court Number</label>
          <input
            type="number"
            min="1"
            value={courtNumber}
            onChange={(e) => setCourtNumber(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Start Time (ISO format)</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">End Time (ISO format)</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
        >
          Book Reservation
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}

      <h2 className="text-2xl font-semibold mt-8 mb-4">My Reservations</h2>
      <ul className="space-y-3">
        {myReservations.length === 0 && (
          <p className="text-gray-600">No reservations found.</p>
        )}
        {myReservations.map((res) => (
          <li
            key={res.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p>
                <span className="font-semibold">Court:</span> {res.court_number}
              </p>
              <p>
                <span className="font-semibold">Start:</span> {new Date(res.start_time).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">End:</span> {new Date(res.end_time).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(res.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reservations;
