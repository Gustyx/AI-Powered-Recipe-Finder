import { useState } from "react";
import { auth } from "../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const handlePopupMessage = (message) => {
    setPopupMessage(message);

    // Hide the popup after 2 seconds
    setTimeout(() => {
      setPopupMessage("");
    }, 2000);
  };

  const signIn = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setLoading(false);
        navigate("/home");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-credential") {
          handlePopupMessage("Login credentials are invalid!");
        }
        if (error.code === "auth/invalid-email") {
          handlePopupMessage("That email address is invalid!");
        }
        console.error(error);
      });
  };

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
        <button class="custom-button" onClick={signIn}>
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
        {loading && <Spinner />}
      </div>
      {popupMessage && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "5px",
            fontSize: "14px",
            opacity: "0.9",
          }}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
}

export default Login;
