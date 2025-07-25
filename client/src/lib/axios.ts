import axios from "axios";

const api = axios.create({
  baseURL: "https://site242541.tw.cs.unibo.it",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default api;
