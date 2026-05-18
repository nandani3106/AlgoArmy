import axios from "axios";

const BASE_URL = "http://localhost:5000/api/contests";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getContests = () => axios.get(BASE_URL);

export const getContestById = (id) =>
  axios.get(`${BASE_URL}/${id}`);

export const createContest = (data) =>
  axios.post(BASE_URL, data, getHeaders());

export const updateContest = (id, data) =>
  axios.put(`${BASE_URL}/${id}`, data, getHeaders());

export const deleteContest = (id) =>
  axios.delete(`${BASE_URL}/${id}`, getHeaders());