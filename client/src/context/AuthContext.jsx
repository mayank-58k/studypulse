import { createContext, useEffect, useReducer } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    case "LOGOUT":
      return { user: null, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      dispatch({ type: "SET", payload: { user: data, loading: false } });
    } catch {
      dispatch({ type: "SET", payload: { user: null, loading: false } });
    }
  };

  useEffect(() => {
    if (localStorage.getItem("studypulse_token")) fetchMe();
    else dispatch({ type: "SET", payload: { loading: false } });
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("studypulse_token", data.token);
    dispatch({ type: "SET", payload: { user: data.user } });
    try {
      await api.post("/streak/checkin");
    } catch {
      // Do not block login if streak endpoint fails.
    }
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("studypulse_token", data.token);
    dispatch({ type: "SET", payload: { user: data.user } });
    try {
      await api.post("/streak/checkin");
    } catch {
      // Do not block register if streak endpoint fails.
    }
  };

  const logout = () => {
    localStorage.removeItem("studypulse_token");
    dispatch({ type: "LOGOUT" });
  };

  return <AuthContext.Provider value={{ ...state, login, register, logout, fetchMe }}>{children}</AuthContext.Provider>;
};
