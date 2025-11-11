import React, { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, Star, ExternalLink,ChevronLeft } from "lucide-react";
import shelfApi from "../../api/ShelfCalls";

export default function MovieItemForm({ shelf, onClose }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("movie");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [userNotes, setUserNotes] = useState("");
  const [rating, setRating] = useState("");
  const [watched, setWatched] = useState(false); // ✅ checkbox state

  const modalRef = useRef();

  // 🪟 Close modal when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 🔍 Auto-search (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await shelfApi.getMovieSearch(query.trim(), type);
        setResults(data.result?.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query, type]);

  const handleSelect = (item) => setSelected(item);

  const handleSave = async () => {
    if (!selected) return;

    const payload = {
      shelfId: shelf._id,
      type: "movie",
      data: {
        id: selected.id,
        title: selected.title || selected.name,
        backdrop: selected.backdrop_path
          ? `https://image.tmdb.org/t/p/w780${selected.backdrop_path}`
          : null,
        poster: selected.poster_path
          ? `https://image.tmdb.org/t/p/w500${selected.poster_path}`
          : null,
        status: watched ? "completed" : "watchlist",
        overview: selected.overview || "",
        genre_ids: selected.genre_ids || [],
        release: selected.release_date || selected.first_air_date || "Unknown",
        user_notes: userNotes || "",
        rating: rating ? parseFloat(rating) : null,
      },
    };

    try {
      await shelfApi.createItem(payload);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error saving movie:", err);
      alert("Failed to save item. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-xl w-[90%] max-w-3xl relative text-white flex flex-col"
        style={{ height: "80vh" }}
      >
        <button
          onClick={() => setSelected(null)}
          className="absolute top-4 right-10 text-gray-300 hover:text-white"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {selected ? "Add to Shelf" : "Search Movie / TV Show"}
        </h2>

        {/* Search Step */}
        {!selected && (
          <>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a movie or TV show..."
                className="flex-1 bg-gray-800 text-white p-2 rounded-lg outline-none"
              />
              <div className="flex gap-3 text-sm text-gray-300 items-center">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="movie"
                    checked={type === "movie"}
                    onChange={(e) => setType(e.target.value)}
                  />
                  Movie
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="tv"
                    checked={type === "tv"}
                    onChange={(e) => setType(e.target.value)}
                  />
                  TV
                </label>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 border-t border-white/10 pt-3">
              {loading && (
                <div className="flex justify-center mt-10 text-gray-400">
                  <Loader2 className="animate-spin mr-2" /> Searching...
                </div>
              )}

              {!loading && !query && (
                <div className="flex flex-col items-center justify-center text-gray-400 mt-10 select-none">
                  <Search size={40} className="opacity-40 mb-2" />
                  <p className="text-lg">
                    Start typing to search for a movie or TV show
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Results will appear automatically
                  </p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className="bg-white/10 rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      {r.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${r.poster_path}`}
                          alt={r.title || r.name}
                          className="w-full h-44 object-contain"
                        />
                      ) : (
                        <div className="h-44 bg-gray-700 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {r.title || r.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {r.release_date || r.first_air_date || "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && query && (
                <p className="text-center text-gray-400 mt-10">
                  No results found for "{query}"
                </p>
              )}
            </div>
          </>
        )}

        {/* Selected Movie Step */}
        {selected && (
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex flex-col md:flex-row gap-4">
              {selected.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${selected.poster_path}`}
                  alt={selected.title || selected.name}
                  className="w-full md:w-1/3 rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-3xl font-bold text-white">{selected.title || selected.name}</h2>
                  <a
                    href={`https://movie-hub404.vercel.app/info?id=${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <ExternalLink size={16} />
                    Visit Page
                  </a>
                </div>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {selected.overview || "No overview available."}
                </p>

                {/* ✅ Watched Checkbox */}
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="watched"
                    checked={watched}
                    onChange={() => setWatched((prev) => !prev)}
                    className="w-4 h-4 cursor-pointer accent-teal-500"
                  />
                  <label htmlFor="watched" className="text-gray-300 text-sm">
                    I’ve watched this {type === "tv" ? "show" : "movie"}
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm text-gray-400">
                    Your Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full bg-gray-800 text-white p-2 rounded-lg resize-none"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Write your thoughts about this movie..."
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm text-gray-400">
                    Your Rating (0–5)
                  </label>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400" size={18} />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="5"
                      className="bg-gray-800 text-white p-2 rounded-lg w-24"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Save to Shelf
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
