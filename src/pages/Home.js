import '../App.css';
import './Favorites';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { db } from '../firebase.config'
import { collection, addDoc } from 'firebase/firestore'

const genAI = new GoogleGenerativeAI("AIzaSyCw-sWxsHWzTrKysOqDHlQQF8NhF0vtHoo");
const UNSPLASH_ACCESS_KEY = 'saXXIrOb2Em6PXItq2qhOdq7ckYu9B-UEhdRNCM12bI';

const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chat = model.startChat({
    history: [],
});
const iDontLikeTheseButtonText = "5 others please."

function Home() {
    const [inputValue, setInputValue] = useState('');
    const [fiveRecipes, setFiveRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRecipes = localStorage.getItem('fiveRecipes');
        if (storedRecipes) {
            setFiveRecipes(JSON.parse(storedRecipes));
        }
    }, []);

    const run = async (userInput) => {
        setLoading(true);
        setFiveRecipes([]);

        const prompt = userInput === iDontLikeTheseButtonText ? iDontLikeTheseButtonText :
            "Hello! This is an AI powered App I created for a project that find recipies base on an input filter. Please give me exactly 5 recipes for " +
            userInput +
            ". Answer me exactly like this please:\n" +
            "-----Recipe-----\n" +
            "Title: {recipe title}\n" +
            "Total preparation time: {in minutes}\n" +
            "Ingredients:\n (enumerate with '-')\n" +
            "Instructions:\n (enumerate with digits).\n" +
            "Please don't use the '*' character in your response.";

        const result = await chat.sendMessage(prompt);
        // const result = await model.generateContent(prompt);
        const respose = await result.response;
        const text = respose.text();

        // console.log(text);

        const recipes = text.split("-----Recipe-----\n");
        const addedRecipes = [];

        for (let i = 1; i <= 5; ++i) {
            const wordsToAddNewline = ["Title:", "Total preparation time:", "Ingredients:", "Instructions:"];
            const modifiedText = wordsToAddNewline.reduce((acc, word) => {
                const regex = new RegExp(`(${word})`, 'g');
                return acc.replace(regex, `\n$1`);
            }, recipes[i]);
            // console.log(modifiedText);

            const recipeBlocks = modifiedText.split('\n\n');

            let recipe = {
                title: recipeBlocks[0].substring(recipeBlocks[0].indexOf(':') + 2, recipeBlocks[0].length),
                time: recipeBlocks[1].substring(recipeBlocks[1].indexOf(':') + 2, recipeBlocks[1].length),
                ingredients: recipeBlocks[2].substring(recipeBlocks[2].indexOf(':') + 2, recipeBlocks[2].length),
                instructions: recipeBlocks[3].substring(recipeBlocks[3].indexOf(':') + 2, recipeBlocks[3].length),
            }

            if (recipe.time.length < 6) {
                recipe.time = recipe.time + " minutes";
            }
            const recipeImage = await fetchRecipeImages(recipe.title);
            recipe = { ...recipe, imageUrl: recipeImage };

            addedRecipes.push(recipe);
        }

        setFiveRecipes(addedRecipes);
        localStorage.setItem('fiveRecipes', JSON.stringify(addedRecipes));
        setLoading(false);
    }

    const addToFavorites = async (recipe) => {
        try {
            await addDoc(collection(db, 'favoriteRecipes'), {
                ...recipe
            })
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }

    const fetchRecipeImages = async (recipeTitle) => {
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${recipeTitle}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`);
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
    }

    return (
        <div className="Home">
            <div lang="en">
                <div class="search-container">
                    <input type="text" autoCapitalize="sentences" placeholder="What do you feel like eating?" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                    <button class="search-button" onClick={() => { run(inputValue); }}>&#128269;</button>
                </div>
                <button class="custom-button" onClick={() => { navigate(`/favorites`); }}>Favorite Recipes</button>
                {loading && (
                    <Spinner />
                )}
                {fiveRecipes.length !== 0 && (
                    <div class="suggestions-container">
                        <h2>Suggested recipes</h2>
                        {fiveRecipes.map((recipe, index) => {
                            return (<div key={index} class="recipe-card" onClick={() => { navigate(`/recipeDetailsPage/${index}${recipe.title}`, { state: { element: recipe, favorite: false } }); }} style={{ cursor: 'pointer' }}>
                                {/* <div class="recipe-small-image"> */}
                                <img class="recipe-small-image" src={recipe.imageUrl} alt={recipe.title} />
                                {/* </div> */}
                                <div class="recipe-details">
                                    <h3>{recipe.title}</h3>
                                    <p>{recipe.time}</p>
                                </div>
                                <div class="recipe-favorite">
                                    <button onClick={(e) => { e.stopPropagation(); addToFavorites(recipe); }}>&#9829;</button>
                                </div>
                            </div>)
                        })}
                        <button class="custom-button" onClick={() => { run(iDontLikeTheseButtonText); }}>I don't like these</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;