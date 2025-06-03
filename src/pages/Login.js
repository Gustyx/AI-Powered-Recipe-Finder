import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { auth } from "../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Login.css"; // 🔹 Separated styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePopupMessage = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
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
        } else if (error.code === "auth/invalid-email") {
          handlePopupMessage("That email address is invalid!");
        } else {
          handlePopupMessage("Something went wrong!");
        }
        setLoading(false);
      });
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>

      <div className="login-content">
        <h1>Login</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="search-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="custom-button" onClick={signIn}>
          Log In
        </button>

        <div className="login-footer">
          Don’t have an account?{" "}
          <a href="/register" className="login-link">
            Register here
          </a>
        </div>

        {loading && <Spinner />}
      </div>

      {popupMessage && (
        <div className="popup-message">
          {popupMessage}
        </div>
      )}
    </div>
  );
}

export default Login;
