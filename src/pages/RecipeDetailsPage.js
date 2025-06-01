import { useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase.config";

export default function RecipeDetailsPage() {
  const location = useLocation();
  const { state } = location;
  const recipeDetails = state ? state.element : undefined;
  const [isFavorite, setIsFavorite] = useState(
    state ? (state.favorite === null ? false : true) : undefined
  );
  const favoriteRecipes = state ? state.allRecipes : undefined;
  const selectedAllergies = state ? state.allergies : undefined;
  const [popupMessage, setPopupMessage] = useState("");

  const addToFavorites = async (recipe) => {
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        preferences: selectedAllergies,
        favoriteRecipes: [...favoriteRecipes, recipe],
      });
      console.log(`Recipe has been added successfully.`);
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  const removeFromFavorites = async (recipeToRemove) => {
    try {
      const updatedFavorites = favoriteRecipes.filter(
        (r) =>
          r.title !== recipeToRemove.title &&
          r.time !== recipeToRemove.time &&
          r.instructions !== recipeToRemove.instructions &&
          r.ingredients !== recipeToRemove.ingredients &&
          r.imageUrl !== recipeToRemove.imageUrl
      );
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        preferences: selectedAllergies,
        favoriteRecipes: updatedFavorites,
      });
      console.log(`Recipe has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handeFavoriteButton = async () => {
    isFavorite
      ? removeFromFavorites(recipeDetails)
      : addToFavorites(recipeDetails);
    setIsFavorite(!isFavorite);
  };

  const addToCart = (message) => {
    setPopupMessage(message);

    // Hide the popup after 2 seconds
    setTimeout(() => {
      setPopupMessage("");
    }, 2000);
  };

  return (
    <div className="RecipeDetailsPage">
      <div lang="en">
        <div class="container">
          <div class="left">
            <img
              class="recipe-large-image"
              src={recipeDetails.imageUrl}
              alt={recipeDetails.title}
            />
            <div class="recipe-title-and-time">
              <div class="recipe-details-text">
                <h3>{recipeDetails.title}</h3>
                <p>{recipeDetails.time}</p>
              </div>
              <div
                class={
                  isFavorite ? "filled-recipe-favorite" : "recipe-favorite"
                }
              >
                <button type="button" onClick={handeFavoriteButton}>
                  &#9829;
                </button>
              </div>
            </div>
            <button
              class="custom-button"
              onClick={() => {
                localStorage.setItem(
                  "ingredients",
                  JSON.stringify(recipeDetails.ingredients.split("- "))
                );
                setTimeout(() => setPopupMessage(""), 2000);
                addToCart("Ingredients added to cart!");
              }}
            >
              Add to cart
            </button>
          </div>
          <div class="right">
            <div class="recipe-section">
              <div class="recipe-section-title">Ingredients:</div>
              <ul class="recipe-dotted-list">
                {recipeDetails.ingredients
                  .split("- ")
                  .map(
                    (ingredient, index) =>
                      ingredient &&
                      index > 0 && <li key={index}>{ingredient}</li>
                  )}
              </ul>
              <div class="recipe-section-title">Instructions:</div>
              <ul class="recipe-simple-list">
                {recipeDetails.instructions
                  .split("\n")
                  .map(
                    (instruction, index) =>
                      instruction && (
                        <li key={index}>
                          {instruction.substring(3, instruction.length)}
                        </li>
                      )
                  )}
              </ul>
            </div>
          </div>
        </div>
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