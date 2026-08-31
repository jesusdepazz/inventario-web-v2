import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState({ rol: null, token: null, name: null });

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    const token = localStorage.getItem("tokenApp");
    const name = localStorage.getItem("name");
    setUser({ rol, token, name });
  }, []);

  return user;
};
