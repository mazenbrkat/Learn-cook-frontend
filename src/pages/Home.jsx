import { useState, useEffect, useRef } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import SearchFilter from "../components/SearchFilter";
import "../styles/Home.css";
function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "" });
  const searchTimeout = useRef();

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const fetchRecipes = async () => {
        setLoading(true);
        try {
          const res = await axios.get("http://localhost:5000/api/recipes", {
            params: { search: filters.search }
          });
          setRecipes(res.data.recipes);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRecipes();
    }, 600); // Debounce 600ms
    return () => clearTimeout(searchTimeout.current);
  }, [filters]);

  return (
    <div>

      {/* 🔥 HERO */}
      <div className="hero-section">
  <div className="hero-content">
    <h1>تعلم & اطبخ</h1>
    <p>أفضل وصفات العالم بين إيدك</p>

    <SearchFilter onFilter={setFilters} />
  </div>
</div>

      {/* 🍔 RECIPES */}
    <div className="recipes-section">

  {/* 🔥 Title */}
  <div className="section-header text-center mb-5">
    <h2>🍽️ اكتشف الوصفات</h2>
    <p>أفضل الأكلات المختارة لك</p>
  </div>

  {/* 📦 Grid بدون container */}
  <div className="recipes-grid">

    {loading ? (
      // Skeleton Loader
      Array.from({ length: 6 }).map((_, idx) => (
        <div className="skeleton-card" key={idx}>
          <div className="skeleton-img" />
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
        </div>
      ))
    ) : recipes.length > 0 ? (
      recipes.map((recipe) => (
        <div key={recipe._id}>
          <RecipeCard recipe={recipe} />
        </div>
      ))
    ) : (
      <div className="text-center py-5">
        <h5>😢 لا توجد وصفات</h5>
      </div>
    )}

  </div>

</div>
    </div>
  );
}

export default Home;