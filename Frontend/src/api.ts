import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Aapka backend URL
});

// Yeh function har request se pehle chalega aur automatically token add karega
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
