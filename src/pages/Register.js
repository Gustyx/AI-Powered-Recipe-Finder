import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { auth, db } from "../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [popupMessage, setPopupMessage] = useState("");

  const handlePopupMessage = (message) => {
    setPopupMessage(message);

    // Hide the popup after 2 seconds
    setTimeout(() => {
      setPopupMessage("");
    }, 2000);
  };

  const signUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log(user);
        try {
          //await setDoc(user.uid, {
          //vegan: 0,
          //});
          const docRef = await addDoc(collection(db, "users"), {
            vegan: 1,
          });
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
            signUp();
          }}
        >
          Create Account
        </button>
        <div style={{ padding: "25px", fontSize: "20px" }}>
          Already have an account?{" "}
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
        {/* {loading && <Spinner />} */}
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
