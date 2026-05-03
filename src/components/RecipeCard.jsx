import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function RecipeCard({ recipe }) {
  // استخراج بيانات المستخدم
  const user = JSON.parse(localStorage.getItem("user"));
  
  // States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [anim, setAnim] = useState(false);

  // 1. التحقق هل المستخدم واضع قلب (Liked) أم لا عند تحميل الكارت
  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:5000/api/favorites/check/${recipe._id}/${user.id}`)
        .then(res => setLiked(res.data.liked))
        .catch(err => console.error("Error checking favorite status:", err));
    }
  }, [recipe._id, user?.id]);

  // 2. جلب عدد القلوب الإجمالي (Likes Count) من السيرفر
  useEffect(() => {
  axios.get(`http://localhost:5000/api/favorites/count/${recipe._id}`)
      .then(res => setLikesCount(res.data.count))
      .catch(err => console.error("Error fetching likes count:", err));
  }, [recipe._id, liked]); // يتم التحديث عند تغيير حالة الـ liked (عند الضغط)

  // 3. دالة التبديل (Toggle Like & Favorite)
  const toggleLike = async () => {
    if (!user?.id) return toast.error("سجل دخول أولاً 😅");

    setAnim(true); // تشغيل أنيميشن الضغط
    setTimeout(() => setAnim(false), 300);

    try {
      // نرسل الطلب لمسار favorites لأنه المسار الذي يعرض الوصفات في صفحة "المفضلة"
      const res = await axios.post(`http://localhost:5000/api/favorites/${recipe._id}`, {
        userId: user.id
      });
      
      setLiked(res.data.liked);
      
      // إشعار المستخدم
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
        <img
          src={recipe.image ? `http://localhost:5000${recipe.image}` : "https://via.placeholder.com/400x300"}
          alt={recipe.name}
          className="card-img-top"
          style={{ height: '220px', objectFit: 'cover' }}
        />

        {/* زر القلب */}
        <button 
          className={`fav-btn ${liked ? "liked" : ""} ${anim ? "pop" : ""}`} 
          onClick={toggleLike}
        >
          {liked ? "❤️" : "🤍"}
        </button>

        {/* عداد القلوب */}
        <div className="likes-badge shadow-sm">
          ❤️ {likesCount}
        </div>

        {/* الطبقة الشفافة عند التمرير (Overlay) */}
        <div className="overlay d-flex flex-column justify-content-center align-items-center">
          <h5 className="text-white fw-bold px-2 text-center">{recipe.name}</h5>
          <Link to={`/recipe/${recipe._id}`} className="btn btn-light btn-sm rounded-pill px-4 mt-2">
            عرض الوصفة
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;