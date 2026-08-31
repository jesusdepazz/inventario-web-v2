import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://inveq.guandy.com/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
