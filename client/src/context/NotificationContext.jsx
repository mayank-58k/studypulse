import { createContext, useMemo, useState } from "react";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(
    () => ({
      items,
      addNotification: (item) => setItems((prev) => [item, ...prev].slice(0, 20)),
      clearNotifications: () => setItems([])
    }),
    [items]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
