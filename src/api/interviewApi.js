import axios from "axios";

const API =
  "http://localhost:5000/api/interview-results";

export const getInterviewResults =
  () => axios.get(API);

export const updateInterviewStatus = (
  id,
  status
) =>
  axios.put(
    `${API}/${id}/status`,
    {
      status,
    }
  );