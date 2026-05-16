import axios from "axios";

const BASE_URL = "http://localhost:5000/api/settings";

export const getSettings = () => axios.get(BASE_URL);

export const updateSettings = (data) => axios.put(BASE_URL, data);