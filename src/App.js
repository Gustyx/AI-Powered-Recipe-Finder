import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import Favorites from './pages/Favorites';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="recipeDetailsPage/:title" element={<RecipeDetailsPage />} />
        <Route path="favorites" element={<Favorites />} />
      </Routes>
      </div>
  );
}

export default App;
