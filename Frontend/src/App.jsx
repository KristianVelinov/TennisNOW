import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Header from "./components/Header";
import Main from "./pages/Main";
import Reservations from "./pages/Reservation";
import BookCourt from "./pages/BookCourt";
import ProfileStats from "./pages/ProfileStats";
import "react-datepicker/dist/react-datepicker.css";
import './index.css'
import RateReservation from "./pages/RateReservation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginState = (loggedIn) => {
    setIsLoggedIn(loggedIn);
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} onLogout={() => handleLoginState(false)} />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/book" element={<BookCourt />} />
        <Route path="/stats" element={<ProfileStats />} />
        <Route path="/rate/:reservationId" element={<RateReservation />} />
        <Route path="/login" element={<Login onLogin={handleLoginState} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
