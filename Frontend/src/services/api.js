import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;


export async function signup(username, password, adminPassword = null) {
  const body = { username, password };
  if (adminPassword) {
    body.admin_password = adminPassword;
  }

  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function getMyReservations(token) {
  const res = await fetch(`${API_BASE_URL}/reservations/myreservations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getCourtReservations(courtNumber, date) {
  const res = await fetch(`${API_BASE_URL}/reservations/court/${courtNumber}/${date}`);
  return res.json();
}

export async function createReservation(token, courtNumber, startTime, endTime) {
  const res = await fetch(`${API_BASE_URL}/reservations/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ court_number: courtNumber, start_time: startTime, end_time: endTime }),
  });
  return res.json();
}

export async function deleteReservation(token, reservationId) {
  const res = await fetch(`${API_BASE_URL}/reservations/delete/${reservationId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateReservation(token, reservationId, updates) {
  const res = await fetch(`${API_BASE_URL}/reservations/update/${reservationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function submitRating(token, reservationId, rating, review = "") {
  const res = await fetch(`${API_BASE_URL}/ratings/rate/${reservationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, review }),
  });
  return res.json();
}

export async function getCourtRatings(courtNumber) {
  const res = await fetch(`${API_BASE_URL}/ratings/court/${courtNumber}/ratings`);
  return res.json();
}

export async function getProfileStats(token) {
  const res = await fetch(`${API_BASE_URL}/profile/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
