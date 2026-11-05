import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/shared.css";   // ← ต้องมี และต้องอยู่ก่อน App
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);