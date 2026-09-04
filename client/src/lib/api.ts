// import axios from "axios";

// export const api = axios.create({
//   baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default api;
