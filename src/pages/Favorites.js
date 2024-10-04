import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

function Favorites() {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [displayedRecipes, setDisplayedRecipes] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavoriteRecipes = async () => {
            const recipesCollection = collection(db, "favoriteRecipes");
            try {
                const snapshot = await getDocs(recipesCollection);

                const recipes = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                return recipes;
            } catch (error) {
                console.error("Error fetching recipes:", error);
            }
        }
        setLoading(true);
        fetchFavoriteRecipes().then((recipes) => {
            setFavoriteRecipes(recipes);
            setDisplayedRecipes(recipes);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const filteredRecipes = favoriteRecipes.filter((recipe) => {
            return recipe.title.toLowerCase().includes(inputValue.toLowerCase());
        });
        setDisplayedRecipes(filteredRecipes);
    }, [inputValue]);

    const searchFavoriteRecipes = () => {
        const filteredRecipes = favoriteRecipes.filter((recipe) => {
            return recipe.title.toLowerCase().includes(inputValue.toLowerCase());
        });
        setDisplayedRecipes(filteredRecipes);
    }

    const removeFromFavorites = async (recipeId) => {
        try {
            const recipeDocRef = doc(db, "favoriteRecipes", recipeId);
            await deleteDoc(recipeDocRef);

            setFavoriteRecipes((prevRecipes) => prevRecipes.filter(recipe => recipe.id !== recipeId));
            setDisplayedRecipes((prevRecipes) => prevRecipes.filter(recipe => recipe.id !== recipeId));

            console.log(`Recipe with ID ${recipeId} has been deleted successfully.`);
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }

    return (
        <div className="Favorites">
            <div lang="en">
                <div class="search-container">
                    <input type="text" autoCapitalize="sentences" placeholder="What do you feel like eating?" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                    <button class="search-button" onClick={() => { searchFavoriteRecipes() }}>&#128269;</button>
                </div>
                <button class="custom-button" onClick={() => { navigate(`/`); }}>Find new Recipes</button>
                {loading && (
                    <Spinner />
                )}
                {favoriteRecipes.length !== 0 && (
                    <div class="suggestions-container">
                        <h2>Favorites</h2>
                        {displayedRecipes.length !== 0 ? (displayedRecipes.map((recipe, index) => {
                            return (
                                <div key={index} class="recipe-card" onClick={() => { navigate(`/recipeDetailsPage/${index}${recipe.title}`, { state: { element: recipe, favorite: true } }); }} style={{ cursor: 'pointer' }}>
                                    <img class="recipe-small-image" src={recipe.imageUrl} alt={recipe.title} />
                                    <div class="recipe-details">
                                        <h3>{recipe.title}</h3>
                                        <p>{recipe.time}</p>
                                    </div>
                                    <div class="filled-recipe-favorite">
                                        <button onClick={(e) => { e.stopPropagation(); removeFromFavorites(recipe.id); }}>&#9829;</button>
                                    </div>
                                </div>
                            )
                        })) : <p>No recipes to display.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favorites;