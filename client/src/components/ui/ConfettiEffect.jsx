import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiEffect({ trigger }) {
  useEffect(() => {
    if (!trigger) return;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00ff88', '#00d4ff', '#ff6b35', '#ffffff'],
    });
  }, [trigger]);
  return null;
}
