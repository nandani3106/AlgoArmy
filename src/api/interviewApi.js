import axios from "axios";

const BASE_URL = "http://localhost:5000/api/interview-results";

export const getInterviewResults = () => axios.get(BASE_URL);

export const createInterviewResult = (data) =>
  axios.post(BASE_URL, data);