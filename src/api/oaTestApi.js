import axios from "axios";

const BASE_URL = "http://localhost:5000/api/oa-tests";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getOATests = () => axios.get(BASE_URL, getHeaders());

export const createOATest = (data) => axios.post(BASE_URL, data, getHeaders());

export const updateOATest = (id, data) =>
  axios.put(`${BASE_URL}/${id}`, data, getHeaders());

export const deleteOATest = (id) =>
  axios.delete(`${BASE_URL}/${id}`, getHeaders());

export const getOATestById = (id) =>
  axios.get(`${BASE_URL}/${id}`, getHeaders());