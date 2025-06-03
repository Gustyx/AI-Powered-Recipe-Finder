import { useState, useEffect, useRef } from "react";
import Spinner from "../components/Spinner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import './Kart.css';

function Favorites() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [displayedRecipes, setDisplayedRecipes] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const selectedAllergies = useRef([]);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          selectedAllergies.current = data.preferences;
          setFavoriteRecipes(data.favoriteRecipes);
          setDisplayedRecipes(data.favoriteRecipes);
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    setLoading(true);
    fetchFavoriteRecipes().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filteredRecipes = favoriteRecipes.filter((recipe) => {
      return recipe.title.toLowerCase().includes(inputValue.toLowerCase());
    });
    setDisplayedRecipes(filteredRecipes);
  }, [inputValue, favoriteRecipes]);

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
      setFavoriteRecipes(updatedFavorites);
      setDisplayedRecipes(updatedFavorites);
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        preferences: selectedAllergies.current,
        favoriteRecipes: updatedFavorites,
      });
      console.log(`Recipe has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  return (
    <div className="Favorites">
      <div lang="en">
          <button className="cart-button" onClick={() => navigate('/kart')}>
      {/* Simple cart SVG icon */}
      <svg className="cart-icon" viewBox="0 0 24 24">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 
          0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 
          2-2-.9-2-2-2zM7.16 14.26l.03.01 11.45-.01a1 
          1 0 00.98-.8l1.38-6.16A.998.998 0 0019.07 
          6H6.21l-.94-2H1v2h2l3.6 
          7.59-1.35 2.44C4.52 16.37 5.48 
          18 7 18h12v-2H7l1.16-1.74z" />
      </svg>
    </button>
        <div class="search-container">
          <input
            type="text"
            autoCapitalize="sentences"
            placeholder="Search your recipes"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
          />
          <button class="search-button">&#128269;</button>
        </div>
        <button
          class="custom-button"
          onClick={() => {
            navigate(`/home`);
          }}
        >
          Find new Recipes
        </button>
        {loading && <Spinner />}
        <div class="suggestions-container">
          <h2>Favorites</h2>
          {displayedRecipes.length !== 0 ? (
            displayedRecipes.map((recipe, index) => {
              return (
                <div
                  key={index}
                  class="recipe-card"
                  onClick={() => {
                    navigate(`/recipeDetailsPage/${index}${recipe.title}`, {
                      state: {
                        element: recipe,
                        favorite: true,
                        allRecipes: favoriteRecipes,
                        allergies: selectedAllergies,
                      },
                    });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    class="recipe-small-image"
                    src={recipe.imageUrl}
                    alt={recipe.title}
                  />
                  <div class="recipe-details">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.time}</p>
                  </div>
                  <div class="filled-recipe-favorite">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(recipe);
                      }}
                    >
                      &#9829;
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No recipes to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
