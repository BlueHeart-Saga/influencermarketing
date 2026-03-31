// // src/pages/Collaborations.jsx
// import React, { useEffect, useState } from "react";
// import ChatContainer from "../components/chat/ChatContainer";

// const Collaborations = ({ role }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         // 1️⃣ Try to get user from localStorage (after login)
//         const storedUser = JSON.parse(localStorage.getItem("user"));
//         if (storedUser) {
//           setUser(storedUser);
//           setLoading(false);
//           return;
//         }

//         // 2️⃣ If not in localStorage, fetch from /auth/me
//         const token = localStorage.getItem("access_token"); // JWT from login
//         if (!token) {
//           console.error("No access token found. User must log in first.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch("/auth/me", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) {
//           console.error("Failed to fetch current user:", res.status);
//           setLoading(false);
//           return;
//         }

//         const data = await res.json();
//         const currentUser = {
//           id: data.id,
//           username: data.username,
//           role: data.role,
//         };

//         setUser(currentUser);
//         localStorage.setItem("user", JSON.stringify(currentUser));
//       } catch (err) {
//         console.error("Error fetching current user:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCurrentUser();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (!user) return <div>Please log in to view collaborations.</div>;

//   return (
//     <div className="collaborations-page">
//       <ChatContainer user={user} role={role} />
//     </div>
//   );
// };

// export default Collaborations;
