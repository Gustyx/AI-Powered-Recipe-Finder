import { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="Login">
      <div lang="en">
        <h1 style={{ padding: "25px", color: "#65558F", fontSize: "69px" }}>
          Login
        </h1>
        <div class="search-container">
          <input
            type="text"
            autoCapitalize="sentences"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div class="search-container">
          <input
            type="text"
            autoCapitalize="sentences"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <button class="custom-button" onClick={() => {}}>
          Log in
        </button>
        <div style={{ padding: "25px", fontSize: "20px" }}>
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#65558F",
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Register here
          </a>
        </div>
        {/* {loading && <Spinner />} */}
      </div>
    </div>
  );
}

export default Login;
