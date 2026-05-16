import axios from "axios";

const API =
  "http://localhost:5000/api/ai-interviews";

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