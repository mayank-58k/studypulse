import { useEffect, useState } from "react";
import api from "../api/axios";

export default function useStreak() {
  const [streak, setStreak] = useState({ streakCount: 0, longestStreak: 0, lastActiveDate: null });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/streak");
      setStreak(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("studypulse_token")) refresh();
  }, []);

  return { streak, loading, refresh };
}
