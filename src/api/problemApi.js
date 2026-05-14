import axios from "axios";

const API = axios.create({
  baseURL:
    "http://localhost:5000/api/problems",
});

export const getProblems =
  () => API.get("/");

export const createProblem =
  (data) =>
    API.post("/", data);

export const fetchLeetCode =
  (url) =>
    API.post(
      "/leetcode",
      {
        url,
      }
    );