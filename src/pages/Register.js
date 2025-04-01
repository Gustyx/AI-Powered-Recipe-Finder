import { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="Register">
      <div lang="en">
        <h1 style={{ padding: "25px", color: "#65558F", fontSize: "69px" }}>
          Register
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
          Create Account
        </button>
        {/* {loading && <Spinner />} */}
      </div>
    </div>
  );
}

export default Register;
