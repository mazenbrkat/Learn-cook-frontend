import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/Admin.css";
function Admin() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    _id: null,
    name: "",
    ingredients: "",
    video: "",
    instructions: "",
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔐 user + token
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ❌ منع الدخول
  if (!user || user.role !== "admin") {
    return <h3 className="text-center mt-5">🚫 Not Authorized</h3>;
  }

  // ================= YouTube Fix =================
  const convertToEmbedUrl = (url) => {
    if (!url) return "";

    try {
      if (url.includes("/embed/")) {
        const id = url.split("/embed/")[1].split(/[?&]/)[0];
        return `https://www.youtube.com/embed/${id}`;
      }

      const watchMatch = url.match(/[?&]v=([^&]+)/);
      if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
      }

      const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) {
        return `https://www.youtube.com/embed/${shortMatch[1]}`;
      }

      if (url.length <= 15) {
        return `https://www.youtube.com/embed/${url}`;
      }

      return "";
    } catch {
      return "";
    }
  };

  // ================= Load =================
  const fetchRecipes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/recipes");
      setRecipes(res.data.recipes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // ================= Form =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({
      _id: null,
      name: "",
      ingredients: "",
      video: "",
      instructions: "",
      image: null
    });
    setPreview(null);
    setErrorMsg("");
  };

  // ================= Submit =================
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg("");

  try {
    const formData = new FormData();
    const videoUrl = convertToEmbedUrl(form.video);

    if (form.video && !videoUrl) {
      setErrorMsg("رابط يوتيوب غير صحيح ❌");
      setLoading(false);
      return;
    }

    // 🔥 الخطوة التصحيحية: تحويل النص إلى مصفوفة قبل الإرسال
    // السيرفر يستخدم parseIngredients الذي يفضل JSON أو Array
    const ingredientsArray = form.ingredients
      .split(/\r?\n/)
      .map(i => i.trim())
      .filter(Boolean);

    formData.append("name", form.name);
    formData.append("instructions", form.instructions);
    formData.append("video", videoUrl);
    
    // إرسالها كـ JSON string ليتعامل معها السيرفر بشكل صحيح
    formData.append("ingredients", JSON.stringify(ingredientsArray));

    if (form.image) formData.append("image", form.image);

    const config = {
      headers: {
        Authorization: `Bearer ${token}` // تأكد أن التوكن يحمل صلاحية admin
      }
    };

    if (form._id) {
      // 🔄 UPDATE
      await axios.put(
        `http://localhost:5000/api/recipes/${form._id}`,
        formData,
        config
      );
      setToast("تم التحديث ✅");
      fetchRecipes(); // تحديث القائمة من السيرفر مباشرة لضمان المزامنة
    } else {
      // ➕ ADD
      const res = await axios.post(
        "http://localhost:5000/api/recipes",
        formData,
        config
      );
      setRecipes((prev) => [res.data, ...prev]);
      setToast("تمت الإضافة ✅");
    }

    resetForm();
    setShowModal(false);

  } catch (e) {
    console.error(e);
    // عرض رسالة الخطأ القادمة من السيرفر إذا وجدت لسهولة التصحيح
    const errorDetail = e.response?.data?.errors?.[0]?.msg || e.response?.data?.message;
    setErrorMsg(errorDetail ? `❌ ${errorDetail}` : "❌ مش مسموح أو خطأ في السيرفر");
  } finally {
    setLoading(false);
  }
};
  // ================= Delete =================
  const handleDelete = async (id) => {
    if (!window.confirm("حذف؟")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/recipes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRecipes((prev) => prev.filter((r) => r._id !== id));
      setToast("تم الحذف 🗑");

    } catch (e) {
      console.error(e);
      setToast("❌ مش مسموح");
    }
  };

  // ================= Edit =================
  const handleEdit = (r) => {
    setForm({
      _id: r._id,
      name: r.name,
      ingredients: r.ingredients.join("\n"),
      video: r.video,
      instructions: r.instructions
    });

    setPreview(`http://localhost:5000${r.image}`);
    setShowModal(true);
  };

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="d-flex justify-content-between mb-4">
        <h3>📊 لوحة التحكم</h3>
        <button
          className="btn btn-danger"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + إضافة وصفة
        </button>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h4>{recipes.length}</h4>
            <p>عدد الوصفات</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-3">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>الاسم</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {recipes.map((r) => (
              <tr key={r._id}>
                <td>
                  <div className="img-box">
  <img
    src={`http://localhost:5000${r.image}`}
    alt=""
  />
</div>
                </td>
                <td>{r.name}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(r)}
                  >
                    <FaEdit />

                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(r._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-box">

            <h5>{form._id ? "تعديل" : "إضافة"}</h5>

            {errorMsg && (
              <div className="alert alert-danger">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                className="form-control mb-2"
                name="name"
                placeholder="اسم"
                onChange={handleChange}
                value={form.name}
              />

              <textarea
                className="form-control mb-2"
                name="ingredients"
                placeholder="مكونات"
                onChange={handleChange}
                value={form.ingredients}
              />

              <textarea
                className="form-control mb-2"
                name="instructions"
                placeholder="طريقة"
                onChange={handleChange}
                value={form.instructions}
              />

              <input
                className="form-control mb-2"
                name="video"
                placeholder="رابط يوتيوب"
                onChange={handleChange}
                value={form.video}
              />

              {form.video && convertToEmbedUrl(form.video) && (
                <iframe
                  src={convertToEmbedUrl(form.video)}
                  width="100%"
                  height="200"
                  className="mb-2 rounded"
                />
              )}

              <input
                type="file"
                className="form-control mb-2"
                onChange={handleFileChange}
              />

              {preview && (
                <img src={preview} width="100%" className="mb-2" />
              )}

              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? "..." : "حفظ"}
              </button>
            </form>

            <button
              className="btn btn-link mt-2"
              onClick={() => setShowModal(false)}
            >
              إغلاق
            </button>

          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast-custom">{toast}</div>}

    </div>
  );
}

export default Admin;