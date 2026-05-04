import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function RecipeCard({ recipe }) {
  // 🔗 API URL (local / production)
  const API = import.meta.env.VITE_API_URL;

  // 👤 user
  const user = JSON.parse(localStorage.getItem("user"));

  // 🧠 states
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [anim, setAnim] = useState(false);

  // ✅ check if liked
  useEffect(() => {
    if (user?.id) {
      axios
        .get(`${API}/api/favorites/check/${recipe._id}/${user.id}`)
        .then((res) => setLiked(res.data.liked))
        .catch((err) =>
          console.error("Error checking favorite status:", err)
        );
    }
  }, [recipe._id, user?.id]);

  // ✅ get likes count
  useEffect(() => {
    axios
      .get(`${API}/api/favorites/count/${recipe._id}`)
      .then((res) => setLikesCount(res.data.count))
      .catch((err) =>
        console.error("Error fetching likes count:", err)
      );
  }, [recipe._id, liked]);

  // ❤️ toggle like
  const toggleLike = async () => {
    if (!user?.id) return toast.error("سجل دخول أولاً 😅");

    setAnim(true);
    setTimeout(() => setAnim(false), 300);

    try {
      const res = await axios.post(
        `${API}/api/favorites/${recipe._id}`,
        {
          userId: user.id,
        }
      );

      setLiked(res.data.liked);

      if (res.data.liked) {
        toast.success("❤️ أضيفت للمفضلة");
      } else {
        toast.success("💔 حذفت من المفضلة");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطأ في العملية ❌");
    }
  };

  return (
    <div className="recipe-card shadow-sm border-0 rounded-4 overflow-hidden">
      <div className="image-wrapper position-relative">
        
        {/* 🖼️ Image */}
        <img
          src={
            recipe.image
              ? `${API}${recipe.image}`
              : "https://via.placeholder.com/400x300"
          }
          alt={recipe.name}
          className="card-img-top"
          style={{ height: "220px", objectFit: "cover" }}
        />

        {/* ❤️ Favorite Button */}
        <button
          className={`fav-btn ${liked ? "liked" : ""} ${
            anim ? "pop" : ""
          }`}
          onClick={toggleLike}
        >
          {liked ? "❤️" : "🤍"}
        </button>

        {/* 🔢 Likes Count */}
        <div className="likes-badge shadow-sm">
          ❤️ {likesCount}
        </div>

        {/* 🧊 Overlay */}
        <div className="overlay d-flex flex-column justify-content-center align-items-center">
          <h5 className="text-white fw-bold px-2 text-center">
            {recipe.name}
          </h5>

          <Link
            to={`/recipe/${recipe._id}`}
            className="btn btn-light btn-sm rounded-pill px-4 mt-2"
          >
            عرض الوصفة
          </Link>
        </div>

      </div>
    </div>
  );
}

export default RecipeCard;