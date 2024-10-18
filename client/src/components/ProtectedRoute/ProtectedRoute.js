import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const isAuthenticated = async () => {
  try {
    const response = await axios.get("http://localhost:8080/auth/check", {
      withCredentials: true,
    });
    return response.status === 200;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const ProtectedRoute = ({ element: Component }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsAuth(auth);
    };
    checkAuth();
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>; 
  }

  return isAuth ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
