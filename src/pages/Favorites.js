import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Favorites() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [displayedRecipes, setDisplayedRecipes] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setSelectedAllergies(data.preferences);
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
      //setFavoriteRecipes(recipes);
      //setDisplayedRecipes(recipes);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filteredRecipes = favoriteRecipes.filter((recipe) => {
      return recipe.title.toLowerCase().includes(inputValue.toLowerCase());
    });
    setDisplayedRecipes(filteredRecipes);
  }, [inputValue]);

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
        preferences: selectedAllergies,
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
        {favoriteRecipes.length !== 0 && (
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
                        state: { element: recipe, favorite: true },
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
        )}
      </div>
    </div>
  );
}

export default Favorites;
