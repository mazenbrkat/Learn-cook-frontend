import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

function App() {
  // 🌙 Dark mode
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

 // تأكد أن هذا الجزء موجود في App.js كما كتبناه سابقاً
useEffect(() => {
  if (dark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", dark ? "dark" : "light");
}, [dark]);
  const toggleDark = () => setDark(prev => !prev);

  // 👤 User State
  // نقوم بتعريف الحالة هنا ليتم توزيعها على باقي المكونات
const storedUser = localStorage.getItem("user");

const [user, setUser] = useState(
  storedUser ? JSON.parse(storedUser) : null
);

  return (
    <>
      <Toaster position="bottom-right" />

      {/* 1. تمرير البيانات للـ Navbar ليعرض الصورة والاسم */}
      <Navbar
        user={user}
        setUser={setUser}
        dark={dark}
        toggleDark={toggleDark}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<Details />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* 2. تمرير user و setUser لصفحة البروفايل لتتمكن من تحديث الصورة فوراً */}
        <Route 
          path="/profile" 
          element={<Profile user={user} setUser={setUser} />} 
        />
      </Routes>
    </>
  );
}

export default App;