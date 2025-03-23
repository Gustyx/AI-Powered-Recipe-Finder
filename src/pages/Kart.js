function Kart(ingredients) {
  return (
    <div className="Kart">
      <h2>Your Cart</h2>
      {ingredients.length > 0 ? (
        ingredients.map((ingredient) => (
          <div key={ingredient.id} className="ingredient-card">
            <h3>{ingredient.name}</h3>
            <p>Price: ${ingredient.price}</p>
          </div>
        ))
      ) : (
        <p>No ingredients in the cart.</p>
      )}
    </div>
  );
}

export default Kart;
