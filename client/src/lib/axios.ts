import axios from "axios";

const api = axios.create({
  baseURL: "https://site242541.tw.cs.unibo.it:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default api;
