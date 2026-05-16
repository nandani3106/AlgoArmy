import axios from "axios";

const BASE_URL = "http://localhost:5000/api/oa-tests";

export const getOATests = () => axios.get(BASE_URL);

export const createOATest = (data) => axios.post(BASE_URL, data);

export const getOATestById = (id) =>
  axios.get(`${BASE_URL}/${id}`);