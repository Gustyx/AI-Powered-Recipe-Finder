import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { auth, db } from "../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { allergies } from "../constants";
import "./Register.css"; 

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (allergy) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((item) => item !== allergy)
        : [...prev, allergy]
    );
  };

  const handlePopupMessage = (message) => {
    setPopupMessage(message);
    setTimeout(() => {
      setPopupMessage("");
    }, 2000);
  };

  const signUp = () => {
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        try {
          await setDoc(doc(db, "users", user.uid), {
            preferences: selectedAllergies,
            favoriteRecipes: [],
          });
          setLoading(false);
          navigate("/home");
        } catch (error) {
          handlePopupMessage("Error: " + error.message);
        }
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          handlePopupMessage("That email address is already in use!");
        } else if (error.code === "auth/invalid-email") {
          handlePopupMessage("That email address is invalid!");
        } else {
          handlePopupMessage("Something went wrong!");
        }
        setLoading(false);
      });
    setShowModal(false);
  };

  return (
    <div className="register-container">
      <div className="register-overlay"></div>

      <div className="register-content">
        <h1>Register</h1>

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

        <button className="custom-button" onClick={() => setShowModal(true)}>
          Create Account
        </button>

        <div style={{ marginTop: "20px", fontSize: "16px" }}>
          Already have an account?
          <a href="/login" className="login-link">
            Log In
          </a>
        </div>

        {loading && <Spinner />}
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button
        className="modal-close-x"
        onClick={() => setShowModal(false)}
        aria-label="Close"
      >
        &times;
      </button>

      <h2>Select Preferences</h2>
      <div className="allergy-options">
        {allergies.map((allergy) => (
          <label key={allergy}>
            <input
              type="checkbox"
              checked={selectedAllergies.includes(allergy)}
              onChange={() => handleCheckboxChange(allergy)}
            />
            {allergy}
          </label>
        ))}
      </div>

      <button className="modal-ready-button" onClick={signUp}>
        Ready!
      </button>
    </div>
  </div>
)}

      </div>

      {popupMessage && (
        <div
          style={{
            position: "fixed",
            top: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "5px",
            fontSize: "14px",
            zIndex: 10,
            opacity: "0.95",
          }}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
}

export default Register;
