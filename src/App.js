import "./App.css";
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import Favorites from "./pages/Favorites";
import Kart from "./pages/Kart";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="home" element={<Home />} />
        <Route
          path="recipeDetailsPage/:title"
          element={<RecipeDetailsPage />}
        />
        <Route path="favorites" element={<Favorites />} />
        <Route path="kart" element={<Kart />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
