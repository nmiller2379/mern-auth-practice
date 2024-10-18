import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/dashboard", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setUsername(res.data.user.username);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    axios
      .get("http://localhost:8080/logout", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        navigate("/login");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as {username}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
