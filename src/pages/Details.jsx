import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../socket";
import "../styles/Details.css";
function Details() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔥 Socket listen
  useEffect(() => {
    socket.on("receive-comment", (newComment) => {
      setComments((prev) => [newComment, ...prev]);
    });

    return () => {
      socket.off("receive-comment");
    };
  }, []);

  // 📥 Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeRes = await axios.get(
          `http://localhost:5000/api/recipes/${id}`
        );
        setRecipe(recipeRes.data);

        const ratingRes = await axios.get(
          `http://localhost:5000/api/ratings/${id}`
        );
        setRating(ratingRes.data.userRating);
        setAverageRating(ratingRes.data.averageRating);
        setTotalRatings(ratingRes.data.totalRatings);

        const commentsRes = await axios.get(
          `http://localhost:5000/api/comments/${id}`
        );
        setComments(commentsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ⭐ Rating
const handleRating = async (value) => {
  if (!user) return;

  await axios.post(
    `http://localhost:5000/api/ratings/${id}`,
    {
      rating: value,
      userId: user.id // 🔥 أهم سطر
    }
  );

  const res = await axios.get(
    `http://localhost:5000/api/ratings/${id}`
  );

  setRating(value);
  setAverageRating(res.data.averageRating);
  setTotalRatings(res.data.totalRatings);
};

  // 💬 Add Comment (API + Socket)
// 💬 إضافة تعليق (API + Socket)
const addComment = async () => {
  // جلب المستخدم من التخزين المحلي لضمان الحصول على أحدث صورة بروفايل
  const currentUser = JSON.parse(localStorage.getItem("user"));
  
  if (!currentUser) return alert("سجل دخول أولاً");
  if (!comment.trim()) return;

  try {
    const res = await axios.post(`http://localhost:5000/api/comments/${id}`, {
      text: comment,
      userId: currentUser.id,
      userName: currentUser.name,
      // تأكد أن currentUser.picture يحتوي على المسار الصحيح
      userPicture: currentUser.picture 
    });

    socket.emit("new-comment", res.data);
    setComment("");
  } catch (err) {
    console.error("Error sending comment:", err);
  }
};
  // ❤️ Favorites
 const addToFav = async () => {
  if (!user) return;

  try {
    await axios.post(
      `http://localhost:5000/api/likes/${recipe._id}`,
      {
        userId: user.id // 🔥 مهم
      }
    );
  } catch (err) {
    console.error(err);
  }
};

  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;
  if (!recipe) return <h3 className="text-center mt-5">Not Found</h3>;

  return (
    <div className="details-page">
      <div className="container">

        {/* 🔥 Top */}
        <div className="row g-4">

          {/* LEFT */}
          <div className="col-lg-6">
            {recipe.image && (
              <img
                src={
                  recipe.image.startsWith("http")
                    ? recipe.image
                    : `http://localhost:5000${recipe.image}`
                }
                alt=""
              />
            )}

            {recipe.video && (
              <iframe
                src={recipe.video}
                width="100%"
                height="300"
                allowFullScreen
                className="rounded mt-3"
              />
            )}
          </div>

          {/* RIGHT */}
          <div className="col-lg-6">
            <div className="details-card">

              <h2>{recipe.name}</h2>

              <div className="d-flex gap-3 mb-3">
                <button
                  className="btn btn-outline-danger"
                  onClick={addToFav}
                >
                  ❤️ مفضلة
                </button>

                <span>⭐ {averageRating} ({totalRatings})</span>
              </div>

              {/* ⭐ Stars */}
              <div>
                {[1,2,3,4,5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`star ${star <= rating ? "active" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* 🧂 Ingredients */}
              <h5 className="mt-3">🧂 المكونات</h5>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

            </div>
          </div>
        </div>

        {/* 🍳 Instructions */}
        <div className="mt-5">
          <h4>👨‍🍳 طريقة التحضير</h4>
          <ol className="steps">
            {recipe.instructions
              ?.split("\n")
              .filter(s => s.trim())
              .map((step, i) => (
                <li key={i}>{step}</li>
              ))}
          </ol>
        </div>

        {/* 💬 Comments */}
        <div className="mt-5">

  <h4 className="mb-3">💬 التعليقات</h4>

  {/* ✏️ Add Comment */}
  <div className="comment-box d-flex gap-2 mb-4">

    <input
      className="form-control comment-input"
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="اكتب تعليق..."
    />

    <button
      className="btn btn-primary comment-btn"
      onClick={addComment}
    >
      إرسال
    </button>

  </div>

  {/* 🧾 Comments List */}
  <div className="comments-list">

    {comments.map((c) => (
      <div key={c._id} className="comment-card">

        {/* Avatar */}
        <img
          src={
            c.userPicture && c.userPicture !== ""
              ? (c.userPicture.startsWith("http")
                  ? c.userPicture
                  : `http://localhost:5000${c.userPicture}`)
              : `https://ui-avatars.com/api/?name=${c.userName}&background=random`
          }
          alt={c.userName}
          className="avatar-comment"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${c.userName}&background=random`;
          }}
        />

        {/* Content */}
        <div className="comment-body">

          <div className="comment-header">
            <span className="comment-name">{c.userName}</span>
            <span className="comment-time">
              {new Date(c.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="comment-text">
            {c.text}
          </div>

        </div>

      </div>
    ))}

  </div>

</div>
</div>

        </div>

      
  );
}

export default Details;