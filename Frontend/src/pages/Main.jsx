import React from "react";
import { Link } from "react-router";
import { ArrowRightCircle } from "lucide-react";

export default function Main() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-xl text-center">
        <h2 className="text-3xl font-extrabold text-red-800 mb-4">Welcome to TennisNOW</h2>
        <p className="text-gray-600 mb-6 text-lg">
          Manage your tennis court bookings, track your stats, and leave reviews — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/book" className="flex items-center gap-2 bg-red-800 text-white px-5 py-3 rounded-xl hover:bg-red-900 transition">
            Book a Court <ArrowRightCircle size={20} />
          </Link>
          <Link to="/reservations" className="flex items-center gap-2 border border-red-800 text-red-800 px-5 py-3 rounded-xl hover:bg-red-50 transition">
            My Reservations
          </Link>
        </div>
      </div>
    </div>
  );
}
