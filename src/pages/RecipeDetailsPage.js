import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase.config';

export default function RecipeDetailsPage() {
    const location = useLocation();
    const { state } = location;
    const recipeDetails = state ? state.element : undefined;
    const [isFavorite, setIsFavorite] = useState(state ? state.favorite : undefined);

    const addToFavorites = async (recipe) => {
        try {
            await addDoc(collection(db, 'favoriteRecipes'), {
                ...recipe
            })
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }

    const removeFromFavorites = async (recipeId) => {
        try {
            const recipeDocRef = doc(db, "favoriteRecipes", recipeId);
            await deleteDoc(recipeDocRef);

            console.log(`Recipe with ID ${recipeId} has been deleted successfully.`);
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }

    const handeFavoriteButton = async () => {
        isFavorite ? removeFromFavorites(recipeDetails.id) : addToFavorites(recipeDetails);
        setIsFavorite(!isFavorite);
    }

    return (
        <div class="container">
            <div class="left">
                {/* <div class="recipe-large-image"> */}
                    <img class="recipe-large-image" src={recipeDetails.imageUrl} alt={recipeDetails.title} />
                {/* </div> */}
                <div class="recipe-title-and-time">
                    <div class="recipe-details-text">
                        <h3>{recipeDetails.title}</h3>
                        <p>{recipeDetails.time}</p>
                    </div>
                    <div class={isFavorite ? "filled-recipe-favorite" : "recipe-favorite"}>
                        <button type="button" onClick={handeFavoriteButton}>&#9829;</button>
                        {/* <!-- Heart icon --> */}
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="recipe-section">
                    <div class="recipe-section-title">Ingredients:</div>
                    <ul class="recipe-dotted-list">
                        {recipeDetails.ingredients.split("- ").map((ingredient, index) => (
                            ingredient && index > 0 && (<li key={index}>{ingredient}</li>)
                        ))}
                    </ul>
                    <div class="recipe-section-title">Instructions:</div>
                    <ul class="recipe-simple-list">
                        {recipeDetails.instructions.split("\n").map((instruction, index) => (
                            instruction && (<li key={index}>{instruction.substring(3, instruction.length)}</li>)
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}