import axios from "axios";
import { store } from "../Redux/store";

export const serverApi = axios.create({
    baseURL: "http://192.168.101.69:3000",
    withCredentials: true,
});

serverApi.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.user.user?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);