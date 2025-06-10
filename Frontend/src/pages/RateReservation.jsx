import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { submitRating, getMyReservations } from "../services/api";

function RateReservation() {
  const { reservationId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reservation, setReservation] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchReservation() {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in to rate a reservation.");
        return;
      }

      try {
        const reservations = await getMyReservations(token);
        const res = reservations.find((r) => r.id === Number(reservationId));
        if (!res) {
          setMessage("Reservation not found or does not belong to you.");
          return;
        }
        setReservation(res);
      } catch (error) {
        setMessage("Error loading reservation.");
      }
    }

    fetchReservation();
  }, [reservationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setMessage("Rating must be between 1 and 5.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to submit a rating.");
      return;
    }

    try {
      const result = await submitRating(token, reservationId, rating, review);
      if (result.message === "Rating submitted.") {
        setMessage("Thank you for your review!");
        setSubmitted(true); 
        navigate("/reservations", { state: { refresh: true } });
      } else {
        setMessage(result.message || "Failed to submit rating.");
      }
    } catch (error) {
      setMessage("Error submitting rating.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Rate Your Reservation</h2>

      {reservation && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p>
            <strong>Court:</strong> {reservation.court_number}
          </p>
          <p>
            <strong>From:</strong> {new Date(reservation.start_time).toLocaleString()}
          </p>
          <p>
            <strong>To:</strong> {new Date(reservation.end_time).toLocaleString()}
          </p>
        </div>
      )}

      {message && (
        <p className="mb-4 text-red-600 font-semibold">{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold" htmlFor="rating">
          Rating (1-5):
        </label>
        <input
          type="number"
          id="rating"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded w-full mb-4 p-2"
          required
          disabled={submitted}
        />

        <label className="block mb-2 font-semibold" htmlFor="review">
          Review (optional):
        </label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="border rounded w-full mb-4 p-2"
          rows={4}
          disabled={submitted}
        />

        {!submitted ? (
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Review
          </button>
        ) : (
          <p className="text-gray-500 font-semibold">Review Submitted</p>
        )}
      </form>
    </div>
  );
}

export default RateReservation;
