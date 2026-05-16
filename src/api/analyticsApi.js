import axios from "axios";

export const getAnalytics = () =>
  axios.get("http://localhost:5000/api/analytics");