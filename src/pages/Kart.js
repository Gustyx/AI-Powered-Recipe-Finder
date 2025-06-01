import { useEffect, useState } from "react";


function Kart() {
  const [ingredients, setSelectedIngredients] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ingredients")) || [];
    return saved
      .map(item => (typeof item === "string" ? item.trim() : ""))
      .filter(item =>
        item !== "" && !item.startsWith("(Not In Store)")
      );
  });

  async function loadProductPrices() {
    const fileResponse = await fetch("/PricedProducts.txt");
    const fileContent = await fileResponse.text();
    const lines = fileContent.split("\n").filter(line => line.trim() !== "");

    const productPriceMap = {};
    lines.forEach(line => {
      const [namePart, pricePart] = line.split(" - ");
      if (namePart && pricePart) {
        const price = parseFloat(pricePart.replace(" RON", "").trim());
        productPriceMap[namePart.trim()] = price;
      }
    });

    return productPriceMap;
  }

  const [pricesMap, setPricesMap] = useState({});
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    loadProductPrices().then(setPricesMap);
  }, []);

  const handleClick = (message) => {
    setPopupMessage(message);
    setTimeout(() => {
      setPopupMessage("");
    }, 2000);
  };

  const total = ingredients.reduce((sum, ingredient) => {
    const price = pricesMap[ingredient];
    return sum + (price || 0);
  }, 0);

  return (
    <div className="Kart" style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>🛒 Your Food Cart</h2>
      {ingredients.length > 0 ? (
        ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="recipe-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: "12px",
              padding: "15px 20px",
              marginBottom: "15px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 5px" }}>{ingredient}</h4>
              <span style={{ fontWeight: "bold", color: "#555" }}>
                {pricesMap[ingredient]
                  ? `${pricesMap[ingredient].toFixed(2)} RON`
                  : "Price not found"}
              </span>
            </div>
            {/* Optional: you could add a remove button here */}
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center", margin: "25px" }}>No ingredients in the cart.</p>
      )}

      {ingredients.length > 0 && (
        <div
          style={{
            background: "#f8f8f8",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "20px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <h3>Total: {total.toFixed(2)} RON</h3>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <button
          className="custom-button"
          onClick={() => {
            handleClick("Order placed!");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✅ Buy
        </button>
        <button
          className="custom-button"
          onClick={() => {
            localStorage.setItem("ingredients", JSON.stringify(""));
            setSelectedIngredients([]);
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🗑️ Empty cart
        </button>
      </div>

      {popupMessage && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "6px",
            fontSize: "14px",
            opacity: "0.9",
            zIndex: 999,
          }}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
}

export default Kart;
