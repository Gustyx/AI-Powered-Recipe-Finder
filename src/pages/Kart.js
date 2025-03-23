import { useState } from "react";

function Kart() {
  const [ingredients, setSelectedIngredients] = useState(() => {
    // Load saved allergies from localStorage (if available)
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  });

  const [popupMessage, setPopupMessage] = useState("");

  const handleClick = (message) => {
    setPopupMessage(message);

    // Hide the popup after 2 seconds
    setTimeout(() => {
      setPopupMessage("");
    }, 2000);
  };

  return (
    <div className="Kart">
      <h2>Your Cart</h2>
      {ingredients.length > 0 ? (
        ingredients.map((ingredient) => (
          <div
            style={{ margin: "10px" }}
            key={ingredient.id}
            className="ingredient-card"
          >
            <h3>{ingredient}</h3>
            {/* <p>Price: ${ingredient.price}</p> */}
          </div>
        ))
      ) : (
        <p style={{ margin: "25px" }}>No ingredients in the cart.</p>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "25px",
          marginBottom: "10px",
        }}
      >
        <button
          class="custom-button"
          onClick={() => {
            setTimeout(() => setPopupMessage(""), 2000);
            handleClick("Order placed!");
          }}
        >
          Buy
        </button>
        <button
          class="custom-button"
          onClick={() => {
            localStorage.setItem("ingredients", JSON.stringify(""));
            setSelectedIngredients([]);
          }}
        >
          Emtpy cart
        </button>
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

export default Kart;
