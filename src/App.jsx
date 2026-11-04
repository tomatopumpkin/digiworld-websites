
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/register-success"
          element={<RegisterSuccess />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/parent-portal"
          element={
            <div>
              Parent Portal is coming soon.
            </div>
          }
        />

        <Route
          path="/courses"
          element={<div>Courses page is coming soon.</div>}
        />

        <Route
          path="/booking"
          element={<div>Booking page is coming soon.</div>}
        />

        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
