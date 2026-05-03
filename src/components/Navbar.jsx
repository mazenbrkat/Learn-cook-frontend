import { Link, useLocation } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";
import "../styles/Navbar.css";
function Navbar({ user, setUser, dark, toggleDark }) {

  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isActive = (path) => location.pathname === path ? "active-link" : "";

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container">

        {/* Logo */}
        <Link className="navbar-brand logo" to="/">
          🍳 تعلم & اطبخ
        </Link>

        <div className="ms-auto d-flex align-items-center gap-4">

          {/* Links */}
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            الرئيسية
          </Link>

          <Link to="/favorites" className={`nav-link ${isActive("/favorites")}`}>
            ❤️ المفضلة
          </Link>

          {/* 🔐 Admin يظهر بس لو admin */}
          {user?.role === "admin" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin")}`}>
              ⚙ الإدارة
            </Link>
          )}

        

          {/* 👤 User */}
          
          {user ? (
            <div className="user-menu">

  <div className="user-trigger">
  <img
  src={
    user.picture && user.picture.startsWith("http")
      ? user.picture
      : `http://localhost:5000${user.picture}?t=${new Date().getTime()}` // إضافة التوقيت لمنع الكاش
  }
  className="avatar-nav"
/>
    <span className="username">{user.name}</span>
  </div>

  <div className="dropdown-menu-custom">

    <Link to="/profile" className="dropdown-item">
      👤 الملف الشخصي
    </Link>

    <button className="dropdown-item logout" onClick={logout}>
      🚪 تسجيل خروج
    </button>

  </div>

</div>
          ) : (
            <GoogleLoginButton setUser={setUser} />
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;