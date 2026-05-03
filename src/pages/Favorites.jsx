import { useState, useEffect } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import toast from "react-hot-toast";
import { FaHeartBroken } from "react-icons/fa";
import "../styles/Favorites.css";
function Favorites({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // التأكد من الحصول على بيانات المستخدم بشكل صحيح
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  // ملاحظة: تأكد هل المعرف هو id أم _id
  const userId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // نستخدم المسار الجديد الذي أنشأناه في السيرفر
        const res = await axios.get(`http://localhost:5000/api/favorites/user/${userId}`);
        setFavorites(res.data);
      } catch (err) {
        console.error("خطأ في جلب المفضلة:", err);
        toast.error("فشل في تحميل القائمة");
      } finally {
        setLoading(false); // نضمن توقف التحميل في كل الحالات
      }
    };

    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (recipeId) => {
    if (!userId) return;

    try {
      // ضروري جداً إرسال userId في الـ body
      const res = await axios.post(`http://localhost:5000/api/favorites/${recipeId}`, {
        userId: userId
      });
      
      // إذا كان الرد يحتوي على liked: false يعني تم الحذف
      if (res.data.liked === false) {
        setFavorites(prev => prev.filter(r => r._id !== recipeId));
        toast.success("💔 تم الحذف من المفضلة");
      } else {
        toast.success("❤️ تمت الإضافة للمفضلة");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ ❌");
    }
  };

 return (
  <div className="favorites-page">

    {/* Header */}
    <div className="favorites-header text-center">
      <h1>❤️ وصفاتي المفضلة</h1>
      <p>كل الوصفات اللي عجبتك في مكان واحد</p>
    </div>

    <div className="favorites-container">

      {/* Loading */}
      {loading ? (
        <div className="favorites-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      ) : favorites.length > 0 ? (

        <div className="favorites-grid">
          {favorites.map((recipe) => (
            <div key={recipe._id} className="fav-item">

              {/* Card */}
              <RecipeCard recipe={recipe} />

              {/* Remove Button */}
              <button
                className="remove-btn"
                onClick={() => toggleFavorite(recipe._id)}
              >
                <FaHeartBroken size={14} />
              </button>

            </div>
          ))}
        </div>

      ) : (

        <div className="empty-state">
          <h3>😢 مفيش مفضلة لسه</h3>
          <p>ابدأ ضيف وصفاتك المفضلة ❤️</p>
        </div>

      )}

    </div>
  </div>
);
}

export default Favorites;