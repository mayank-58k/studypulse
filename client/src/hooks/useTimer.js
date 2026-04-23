import { useEffect, useRef, useState } from "react";

export default function useTimer(initialSeconds = 1500) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setSeconds((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = (nextSeconds = initialSeconds) => {
    setRunning(false);
    setSeconds(nextSeconds);
  };

  return { seconds, setSeconds, running, setRunning, reset };
}
