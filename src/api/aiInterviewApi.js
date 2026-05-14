import axios from "axios";

const BASE_URL = "http://localhost:5000/api/ai-interviews";

export const getAIInterviews = () => axios.get(BASE_URL);

export const createAIInterview = (data) =>
  axios.post(BASE_URL, data);

export const getAIInterviewById = (id) =>
  axios.get(`${BASE_URL}/${id}`);