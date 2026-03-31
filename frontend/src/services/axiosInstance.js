// import axios from "axios";
// import API_BASE_URL from "../config/api";

// const api = axios.create({
//   baseURL: {API_BASE_URL}, // <-- your FastAPI backend URL
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

// // Optional: intercept responses to handle 401 globally
// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem("user"); // clear invalid token
//       window.location.href = "/login";  // redirect to login
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
