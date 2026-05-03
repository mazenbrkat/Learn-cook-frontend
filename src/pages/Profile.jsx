import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import "../styles/Profile.css";
function Profile({ user: userProp, setUser }) {
  const user = userProp || JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState({ likes: [], comments: [], ratings: [] });
  const [tab, setTab] = useState("likes");
  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setNewName(user.name || "");
      setPreview(user.picture || "");
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/profile/${user.id}`);
      setData(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newName);
      if (newImage) formData.append("image", newImage);

      const res = await axios.put(`http://localhost:5000/api/profile/${user.id}`, formData);
      localStorage.setItem("user", JSON.stringify(res.data));
      if (setUser) setUser(res.data);
      setEdit(false);
      alert("✅ تم تحديث البيانات بنجاح");
    } catch (err) {
      alert("❌ حصل خطأ أثناء التحديث");
    }
  };

  if (!user) return <h3 className="text-center mt-5 ">يرجى تسجيل الدخول أولاً</h3>;
  if (loading) return <h3 className="text-center mt-5 ">جاري تحميل البيانات...</h3>;

  return (
    <div className="profile-container container py-5">
      {/* 👤 Header Section */}
      <div className="profile-header-card shadow-sm rounded-4 bg-white p-4 mb-5 text-center">
        <div className="position-relative d-inline-block">
          <img
            src={user.picture ? (user.picture.startsWith('http') ? user.picture : `http://localhost:5000${user.picture}`) : "https://via.placeholder.com/150"}
            className="profile-avatar rounded-circle shadow border border-4 border-white"
            alt="avatar"
          />
          <button className="edit-overlay-btn shadow-sm" onClick={() => setEdit(true)}>
             <FaEdit size={14} />
          </button>
        </div>
        <h2 className="mt-3 fw-bold text-dark">{user.name}</h2>
        <p className="text-muted mb-4">{user.email}</p>
        
        {/* Stats Cards */}
        <div className="d-flex justify-content-center gap-4">
          <div className="stat-item">
            <span className="fw-bold d-block">{data.likes.length}</span>
            <small className="text-muted">مفضلة</small>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="fw-bold d-block">{data.comments.length}</span>
            <small className="text-muted">تعليق</small>
          </div>
        </div>
      </div>

      {/* 📑 Tabs Navigation */}
      <div className="custom-tabs d-flex justify-content-center mb-4 p-1 bg-light rounded-pill shadow-sm">
        <button className={`tab-btn ${tab === 'likes' ? 'active' : ''}`} onClick={() => setTab("likes")}>❤️ المفضلة</button>
        <button className={`tab-btn ${tab === 'comments' ? 'active' : ''}`} onClick={() => setTab("comments")}>💬 التعليقات</button>
        <button className={`tab-btn ${tab === 'ratings' ? 'active' : ''}`} onClick={() => setTab("ratings")}>⭐ تقييماتي</button>
      </div>

      {/* 📦 Tab Content */}
      <div className="content-area">
        {tab === "likes" && (
          <div className="row g-4">
            {data.likes.length > 0 ? data.likes.map((recipe) => (
              <div className="col-lg-3 col-md-4 col-6" key={recipe._id}>
                <div className="recipe-mini-card shadow-sm rounded-3 overflow-hidden border-0 h-100">
                  <div className="image-container">
                    <img src={`http://localhost:5000${recipe.image}`} className="w-100 h-100 object-fit-cover" alt="" />
                  </div>
                  <div className="p-2 text-center">
                    <span className="small fw-bold text-truncate d-block">{recipe.name}</span>
                  </div>
                </div>
              </div>
            )) : <div className="text-center w-100 py-5 text-muted">لم تضف أي وصفات للمفضلة بعد</div>}
          </div>
        )}

        {tab === "comments" && (
          <div className="comments-timeline mx-auto" style={{ maxWidth: '700px' }}>
            {data.comments.length > 0 ? data.comments.map((c) => (
              <div key={c._id} className="comment-card shadow-sm p-3 mb-3 rounded-3 bg-white border-start border-4 border-primary">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold">{c.recipeId?.name || "وصفة غير متوفرة"}</h6>
                  <span className="badge bg-light text-muted fw-normal">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mb-0 text-secondary">{c.text}</p>
              </div>
            )) : <div className="text-center py-5 text-muted">لا توجد تعليقات سابقة</div>}
          </div>
        )}

        {tab === "ratings" && (
          <div className="ratings-grid mx-auto" style={{ maxWidth: '600px' }}>
            {data.ratings.length > 0 ? data.ratings.map((r) => (
              <div key={r._id} className="rating-row shadow-sm p-3 mb-2 rounded-3 bg-white d-flex justify-content-between align-items-center">
                <span className="fw-medium text-dark">{r.recipeId?.name}</span>
                <div className="stars-wrapper text-warning">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
              </div>
            )) : <div className="text-center py-5 text-muted">لم تقم بتقييم أي وصفة</div>}
          </div>
        )}
      </div>

      {/* ✏️ Edit Modal المحسن */}
      {edit && (

        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="modal-content-custom bg-white p-4 rounded-4 shadow-lg animate__animated animate__zoomIn">
            <h4 className="fw-bold mb-4">تعديل الملف الشخصي</h4>
            
            <div className="text-center mb-4">
               <img src={preview.startsWith("blob") ? preview : `http://localhost:5000${preview}`} className="rounded-circle mb-2" style={{width: '100px', height: '100px', objectFit: 'cover'}} />
               <input type="file" id="file-upload" className="d-none" onChange={(e) => {
                 const file = e.target.files[0];
                 setNewImage(file);
                 setPreview(URL.createObjectURL(file));
               }} />
               <label htmlFor="file-upload" className="btn btn-sm btn-outline-secondary d-block mx-auto" style={{width: 'fit-content'}}>تغيير الصورة</label>
            </div>

            <label className="small text-muted mb-1">الاسم بالكامل</label>
            <input className="form-control rounded-pill mb-4" value={newName} onChange={(e) => setNewName(e.target.value)} />

            <div className="d-flex gap-2">
              <button className="btn btn-primary rounded-pill w-100 fw-bold" onClick={handleUpdate}>حفظ التغييرات</button>
              <button className="btn btn-light rounded-pill w-100 fw-bold" onClick={() => setEdit(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;