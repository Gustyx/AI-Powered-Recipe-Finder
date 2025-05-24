import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { auth, db } from "../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { allergies } from "../constants";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (allergy) => {
    setSelectedAllergies((prev) => {
      const updatedAllergies = prev.includes(allergy)
        ? prev.filter((item) => item !== allergy) // Remove if already selected
        : [...prev, allergy]; // Add if not selected

      return updatedAllergies;
    });
  };

  const handlePopupMessage = (message) => {
    setPopupMessage(message);

    // Hide the popup after 2 seconds
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
          handlePopupMessage("Error:", error.message);
          console.log(error);
        }
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          handlePopupMessage("That email address is already in use!");
        }

        if (error.code === "auth/invalid-email") {
          handlePopupMessage("That email address is invalid!");
        }
        console.error(error);
      });
    setShowModal(false);
  };

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
        <button
          class="custom-button"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Create Account
        </button>
        <div style={{ padding: "25px", fontSize: "20px" }}>
          Already have an account?
          <a
            href="/login"
            style={{
              color: "#65558F",
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Log In
          </a>
        </div>
        {loading && <Spinner />}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <button className="close-button" onClick={() => signUp()}>
                Ready!
              </button>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
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

export default Register;
