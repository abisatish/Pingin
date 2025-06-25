import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

api.interceptors.request.use((cfg) => {
  console.log("in axios request use method")
  console.log(localStorage)
  const t = localStorage.getItem("token");
  console.log("token", t)
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
