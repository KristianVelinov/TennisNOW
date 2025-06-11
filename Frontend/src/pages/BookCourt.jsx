import React, { useState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { createReservation, getCourtReservations } from "../services/api";

export default function BookCourt() {
    const [message, setMessage] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0] // yyyy-mm-dd
    );
    const [bookedSlots, setBookedSlots] = useState(new Set());

    const courtNumbers = [1, 2, 3, 4, 5, 6];
    const timeslots = Array.from({ length: 13 }, (_, i) => `${8 + i}:00`);

    useEffect(() => {
        async function fetchBooked() {
            try {
                const booked = new Set();

                await Promise.all(
                    courtNumbers.map(async (court) => {
                        const reservations = await getCourtReservations(court, selectedDate);

                        reservations.forEach((res) => {
                            const start = new Date(res.start_time);
                            const hour = start.getHours();
                            booked.add(`${court}|${hour}:00`);
                        });
                    })
                );

                setBookedSlots(booked);
            } catch (error) {
                console.error("Failed to fetch booked slots:", error);
                setBookedSlots(new Set());
            }
        }

        fetchBooked();
    }, [selectedDate]);

    const handleBooking = async (courtNumber, time) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You must be logged in to book a court.");
            return;
        }

        try {
            const hour = time.split(":")[0];
            const paddedHour = hour.padStart(2, "0");
            const startTime = `${selectedDate}T${paddedHour}:00:00`;

            const endHour = parseInt(hour) + 1;
            const paddedEndHour = String(endHour).padStart(2, "0");
            const endTime = `${selectedDate}T${paddedEndHour}:00:00`;

            const res = await createReservation(token, courtNumber, startTime, endTime);

            if (res.message) {
                setMessage(res.message);
            } else if (res.id) {
                setMessage(`Court ${courtNumber} booked for ${time}!`);
                setBookedSlots((prev) => new Set(prev).add(`${courtNumber}|${time}`));
            } else {
                setMessage("Unexpected response from server.");
            }
        } catch (error) {
            console.error("Booking error:", error);
            setMessage("Error booking court. Try again.");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] bg-gradient-to-br from-red-50 to-red-100 p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-5xl text-center">
                <h2 className="text-3xl font-bold text-red-700 mb-4 flex items-center justify-center gap-2">
                    <CalendarPlus size={28} /> Book a Court
                </h2>
                <p className="text-gray-600 mb-6 text-lg">Select your preferred slot and court to secure your game.</p>

                <div className="mb-6 flex justify-center gap-4 items-center">
                    <label className="font-medium text-gray-700">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2 bg-red-200">Time</th>
                                {courtNumbers.map((court) => (
                                    <th key={court} className="border p-2 bg-red-200">Court {court}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeslots.map((time) => (
                                <tr key={time}>
                                    <td className="border p-2 font-medium bg-red-50">{time}</td>
                                    {courtNumbers.map((court) => {
                                        const slotKey = `${court}|${time}`;
                                        const isBooked = bookedSlots.has(slotKey);
                                        return (
                                            <td key={court} className="border p-2">
                                                {!isBooked ? (
                                                    <button
                                                        onClick={() => handleBooking(court, time)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                                                    >
                                                        Book
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm select-none">Booked</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {message && <p className="mt-6 text-red-700 font-semibold">{message}</p>}
            </div>
        </div>
    );
}
