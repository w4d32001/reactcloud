import axios from "axios";

//const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
const BASE_URL = "https://expresscloud-production.up.railway.app/api"
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});
