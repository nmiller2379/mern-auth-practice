import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/register", { username, password })
      .then((res) => {
        console.log(res.data);
        navigate("/login");
      })
      .catch((err) => console.error(err));
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Our site is pretty cool. Register to check it out.</p>
      <form>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
      </form>

      <h4>Already a member?</h4>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
