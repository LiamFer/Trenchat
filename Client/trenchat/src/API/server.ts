import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const serverApi = axios.create({
    baseURL: apiUrl || "http://192.168.101.69:3000",
    withCredentials: true,
});