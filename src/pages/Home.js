import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db, auth } from "../firebase.config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { allergies } from "../constants";

const genAI = new GoogleGenerativeAI("AIzaSyAIg-h3YAR0NcQJT_Y0THY86-z1wEyxrj0");
const UNSPLASH_ACCESS_KEY = "saXXIrOb2Em6PXItq2qhOdq7ckYu9B-UEhdRNCM12bI";

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const chat = model.startChat({
  history: [],
});
const iDontLikeTheseButtonText = "5 others please.";

function Home() {
  const [inputValue, setInputValue] = useState("");
  const [fiveRecipes, setFiveRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [caughtError, setCaughtError] = useState(false);
  const [favoriteButtons, setFavoriteButtons] = useState([null * 5]);
  const [hoveredButtons, setHoveredButtons] = useState([false * 5]);
  const [showModal, setShowModal] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [temporarySelectedAllergies, setTemporarySelectedAllergies] = useState(
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    const storedRecipes = localStorage.getItem("fiveRecipes");
    if (storedRecipes) {
      setFiveRecipes(JSON.parse(storedRecipes));
    }
    const storedFavoriteButtons = localStorage.getItem("favoriteButtons");
    if (storedFavoriteButtons) {
      setFavoriteButtons(JSON.parse(storedFavoriteButtons));
    }
    const fetchPreferences = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setSelectedAllergies(data.preferences);
          setTemporarySelectedAllergies(data.preferences);
          setFavoriteRecipes(data.favoriteRecipes);
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchPreferences();
  }, []);

  const run = async (userInput) => {
    setLoading(true);
    setFiveRecipes([]);
    setFavoriteButtons([null, null, null, null, null]);
    localStorage.setItem(
      "favoriteButtons",
      JSON.stringify([null, null, null, null, null])
    );

    const fileResponse = await fetch("/PricedProducts.txt");
    const fileContent = await fileResponse.text();

    
    const prompt =
      userInput === iDontLikeTheseButtonText
      ? iDontLikeTheseButtonText
      : "Hello! This is an AI-powered app I created for a project that finds recipes based on user preferences and available products. Please generate exactly 5 recipes for: " +
         userInput +
       ". I have the following allergies: " +
        selectedAllergies +
        ".\n\nYou are ONLY allowed to use the exact product names listed below as ingredients. If a recipe requires an ingredient that is NOT in the list, still include it, but clearly mark it with '(Not In Store)' at the beginning of the ingredient name.\n\nHere are the available products:\n" +
        fileContent +
          ". Answer me exactly like this please:\n" +
          "-----Recipe-----\n" +
          "Title: {recipe title}\n" +
          "Total preparation time: {in minutes}\n" +
          "Ingredients:\n (enumerate with '-')\n" +
          "Instructions:\n (enumerate with digits).\n";

    try {
      setCaughtError(false);
      console.log(prompt);

      const result = await chat.sendMessage(prompt);
      const respose = await result.response;
      const text = respose.text().replace(/\*/g, "");
      const recipes = text.split("-----Recipe-----\n");
      const addedRecipes = [];

      for (let i = 1; i <= 5; ++i) {
        const wordsToAddNewline = [
          "Title:",
          "Total preparation time:",
          "Ingredients:",
          "Instructions:",
        ];
        const modifiedText = wordsToAddNewline.reduce((acc, word) => {
          const regex = new RegExp(`(${word})`, "g");
          return acc.replace(regex, `\n$1`);
        }, recipes[i]);

        const recipeBlocks = modifiedText.split("\n\n");
        let recipe = {
          title: recipeBlocks[0].substring(
            recipeBlocks[0].indexOf(":") + 2,
            recipeBlocks[0].length
          ),
          time: recipeBlocks[1].substring(
            recipeBlocks[1].indexOf(":") + 2,
            recipeBlocks[1].length
          ),
          ingredients: recipeBlocks[2].substring(
            recipeBlocks[2].indexOf(":") + 2,
            recipeBlocks[2].length
          ),
          instructions: recipeBlocks[3].substring(
            recipeBlocks[3].indexOf(":") + 2,
            recipeBlocks[3].length
          ),
        };

        if (recipe.time.length < 6) {
          recipe.time = recipe.time + " minutes";
        }
        const recipeImage = await fetchRecipeImages(recipe.title);
        recipe = { ...recipe, imageUrl: recipeImage };

        addedRecipes.push(recipe);
      }
      setFiveRecipes(addedRecipes);
      setLoading(false);
      localStorage.setItem("fiveRecipes", JSON.stringify(addedRecipes));
    } catch (error) {
      setCaughtError(true);
      localStorage.setItem("fiveRecipes", JSON.stringify([]));
      console.log("Error fetching recipes: ", error);
      setLoading(false);
    }
  };

  const handleFavoriteButton = async (recipe, index) => {
    const newFavoriteButtons = [...favoriteButtons];

    if (newFavoriteButtons[index] === null) {
      await addToFavorites(recipe);
      newFavoriteButtons[index] = index;
    } else {
      await removeFromFavorites(recipe);
      newFavoriteButtons[index] = null;
    }

    setFavoriteButtons([...newFavoriteButtons]);
    localStorage.setItem("favoriteButtons", JSON.stringify(newFavoriteButtons));
  };

  const addToFavorites = async (recipe) => {
    try {
      setFavoriteRecipes([...favoriteRecipes, recipe]);
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        preferences: selectedAllergies,
        favoriteRecipes: [...favoriteRecipes, recipe],
      });
      console.log(`Recipe has been added successfully.`);
    } catch (error) {
      console.error("Error deleting recipe:", error);
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
      setFavoriteRecipes(updatedFavorites);
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        preferences: selectedAllergies,
        favoriteRecipes: updatedFavorites,
      });
      console.log(`Recipe has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleMouseHover = (index) => {
    const newHoveredButtons = [...hoveredButtons];
    newHoveredButtons[index] = !newHoveredButtons[index];
    setHoveredButtons(newHoveredButtons);
  };

  const setFavoriteButtonColor = (index) => {
    const purple = "#65558F";
    const grey = "#999";
    if (favoriteButtons[index] !== null) {
      if (!hoveredButtons[index]) {
        return purple;
      }
      return grey;
    }
    if (hoveredButtons[index]) {
      return purple;
    }
    return grey;
  };

  const fetchRecipeImages = async (recipeTitle) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${recipeTitle}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
      } else {
        return "https://via.placeholder.com/400";
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      return "https://via.placeholder.com/400";
    }
  };

  const handleCheckboxChange = (allergy) => {
    setTemporarySelectedAllergies((prev) => {
      const updatedAllergies = prev.includes(allergy)
        ? prev.filter((item) => item !== allergy) // Remove if already selected
        : [...prev, allergy]; // Add if not selected

      return updatedAllergies;
    });
  };

  const updatePreferences = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        preferences: temporarySelectedAllergies,
      });
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
    setSelectedAllergies(temporarySelectedAllergies);
    setShowModal(false);
  };

  const closeModal = () => {
    setTemporarySelectedAllergies(selectedAllergies);
    setShowModal(false);
  };

  return (
    <div className="Home">
      <div lang="en">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "25px",
            marginBottom: "10px",
          }}
        >
          <button class="custom-button" onClick={() => setShowModal(true)}>
            Allergy
          </button>
          <button
            class="custom-button"
            onClick={() => {
              navigate(`/kart`);
            }}
          >
            Kart
          </button>
        </div>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>What do I eat?</h2>
              <div className="allergy-options">
                {allergies.map((allergy) => (
                  <label key={allergy}>
                    <input
                      type="checkbox"
                      checked={temporarySelectedAllergies.includes(allergy)}
                      onChange={() => handleCheckboxChange(allergy)}
                    />
                    {allergy}
                  </label>
                ))}
              </div>
              <button
                className="close-button"
                onClick={() => updatePreferences()}
              >
                Update
              </button>
              <button className="close-button" onClick={() => closeModal()}>
                Close
              </button>
            </div>
          </div>
        )}
        <div class="search-container">
          <input
            type="text"
            autoCapitalize="sentences"
            placeholder="What do you feel like eating?"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
          />
          <button
            className="search-button"
            onClick={() => {
              run(inputValue);
            }}
          >
            &#128269;
          </button>
        </div>
        <button
          class="custom-button"
          onClick={() => {
            navigate(`/favorites`);
          }}
        >
          Favorite Recipes
        </button>
        {loading && <Spinner />}
        {fiveRecipes.length !== 0 ? (
          <div class="suggestions-container">
            <h2>Suggested recipes</h2>
            {fiveRecipes.map((recipe, index) => {
              return (
                <div
                  key={index}
                  class="recipe-card"
                  onClick={() => {
                    navigate(`/recipeDetailsPage/${index}${recipe.title}`, {
                      state: {
                        element: recipe,
                        favorite: favoriteButtons[index],
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
                  <div class="recipe-favorite">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteButton(recipe, index);
                      }}
                      onMouseEnter={() => handleMouseHover(index)}
                      onMouseLeave={() => handleMouseHover(index)}
                      style={{ color: setFavoriteButtonColor(index) }}
                    >
                      &#9829;
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              class="custom-button"
              onClick={() => {
                run(iDontLikeTheseButtonText);
              }}
            >
              I don't like these
            </button>
          </div>
        ) : (
          caughtError && (
            <p className="suggestions-container">
              There was an Error fetching the recipes. Please try again.
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default Home;