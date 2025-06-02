import { useEffect, useState } from "react";
import './Kart.css';

function Kart() {
  const [ingredients, setSelectedIngredients] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ingredients")) || [];
    return saved
      .map(item => (typeof item === "string" ? item.trim() : ""))
      .filter(item => item !== "" && !item.startsWith("(Not In Store)"));
  });

  const [pricesMap, setPricesMap] = useState({});
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    async function loadProductPrices() {
      const response = await fetch("/PricedProducts.txt");
      const text = await response.text();
      const lines = text.split("\n").filter(line => line.trim() !== "");
      const map = {};
      lines.forEach(line => {
        const [namePart, pricePart] = line.split(" - ");
        if (namePart && pricePart) {
          const price = parseFloat(pricePart.replace(" RON", "").trim());
          map[namePart.trim()] = price;
        }
      });
      setPricesMap(map);
    }

    loadProductPrices();
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
    <div className="kart-container">
      <h2 className="kart-title">🛒 Your Food Cart</h2>
      {ingredients.length > 0 ? (
        ingredients.map((ingredient, index) => (
          <div className="recipe-card" key={index}>
            <div className="card-text">
              <h4>{ingredient}</h4>
              <span>
                {pricesMap[ingredient]
                  ? `${pricesMap[ingredient].toFixed(2)} RON`
                  : "Price not found"}
              </span>
            </div>
            <div className="card-image">
              <img
                src={`../../public/avocado.jpg,${ingredient}`}
                alt={ingredient}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="empty-cart">No ingredients in the cart.</p>
      )}

      {ingredients.length > 0 && (
        <div className="total-container">
          <h3>Total: {total.toFixed(2)} RON</h3>
        </div>
      )}

      <div className="button-container">
        <button className="buy-button" onClick={() => handleClick("Order placed!")}>
          ✅ Buy
        </button>
        <button
          className="clear-button"
          onClick={() => {
            localStorage.setItem("ingredients", JSON.stringify(""));
            setSelectedIngredients([]);
          }}
        >
          🗑️ Empty cart
        </button>
      </div>

      {popupMessage && <div className="popup">{popupMessage}</div>}
    </div>
  );
}

export default Kart;
