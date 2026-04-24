import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SubjectProvider } from "./context/SubjectContext";
import { NotificationProvider } from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <SubjectProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "rgba(13, 17, 23, 0.86)",
                  color: "#fff",
                  border: "1px solid rgba(0, 255, 136, 0.45)",
                  boxShadow: "0 0 20px rgba(0,255,136,.25)",
                  borderRadius: "12px"
                }
              }}
            />
            <App />
          </SubjectProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
