import { useState, useEffect, useRef } from "react";

function SearchFilter({ onFilter, recipes = [] }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // 🔥 Live Search
  useEffect(() => {
    const delay = setTimeout(() => {
      onFilter({ search });
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // 🔍 Suggestions
  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = recipes
      .filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(filtered);
    setActiveIndex(-1);
  }, [search, recipes]);

  // 🎯 اختيار عنصر
  const handleSelect = (name) => {
    setSearch(name);
    setSuggestions([]);
    onFilter({ search: name });
  };

  // ⌨️ Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex].name);
      }
    }
  };

  // ❌ Close suggestions عند الضغط برا
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 Highlight search text
  const highlight = (text) => {
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-container" ref={wrapperRef}>

      <div className="search-wrapper">

        <input
          type="text"
          className="form-control rtl-input search-input"
          placeholder="ابحث عن وصفة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-box">
            {suggestions.map((item, index) => (
              <div
                key={item._id}
                className={`suggestion-item ${index === activeIndex ? "active" : ""}`}
                onClick={() => handleSelect(item.name)}
              >
                🔍 {highlight(item.name)}
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

export default SearchFilter;