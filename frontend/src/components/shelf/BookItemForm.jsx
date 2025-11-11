import React, { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, ChevronLeft } from "lucide-react";
import shelfApi from "../../api/ShelfCalls";

export default function BookItemForm({ shelf, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pageRead, setPageRead] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("reading");

  const modalRef = useRef();

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 🔍 Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await shelfApi.getBookSearch(query.trim());
        setResults(data.result?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (book) => setSelected(book);

  const handleSave = async () => {
    if (!selected) return;
    const info = selected.volumeInfo || {};

    const payload = {
      shelfId: shelf._id,
      type: "book",
      data: {
        id: selected.id,
        title: info.title,
        subtitle: info.subtitle || "",
        authors: info.authors || [],
        publish_date: info.publishedDate || "",
        description: info.description || "",
        category: info.categories?.[0] || "",
        language: info.language || "",
        cover_image:
          info.imageLinks?.thumbnail ||
          info.imageLinks?.smallThumbnail ||
          "",
        url: info.infoLink || info.canonicalVolumeLink || "",
        preview_link: info.previewLink || "",
        page_count: info.pageCount || null,
        page_read: pageRead ? parseInt(pageRead, 10) : 0,
        status: selectedStatus,
        user_notes: userNotes || "",
      },
    };

    try {
      await shelfApi.createItem(payload);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error saving book:", err);
      alert("Failed to save book. Try again.");
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
          {selected ? "Add to Shelf" : "Search Books"}
        </h2>

        {/* 🔍 Search Page */}
        {!selected && (
          <>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a book..."
                className="flex-1 bg-gray-800 text-white p-2 rounded-lg outline-none"
              />
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 border-t border-white/10 pt-3">
              {loading && (
                <div className="flex justify-center mt-10 text-gray-400">
                  <Loader2 className="animate-spin mr-2" /> Searching books...
                </div>
              )}

              {!loading && !query && (
                <div className="flex flex-col items-center justify-center text-gray-400 mt-10 select-none">
                  <Search size={40} className="opacity-40 mb-2" />
                  <p className="text-lg">Start typing to search for books</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Results will appear automatically
                  </p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                  {results.map((r) => {
                    const info = r.volumeInfo || {};
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className="bg-white/10 rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                      >
                        {info.imageLinks?.thumbnail ? (
                          <img
                            src={info.imageLinks.thumbnail}
                            alt={info.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (

                          <div className="h-44 bg-gray-700 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {info.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {info.authors?.join(", ") || "Unknown Author"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && results.length === 0 && query && (
                <p className="text-center text-gray-400 mt-10">
                  No books found for “{query}”
                </p>
              )}
            </div>
          </>
        )}

        {/* 📘 Selected Book Page */}
        {selected && (
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex flex-col md:flex-row gap-4">
              {selected.volumeInfo?.imageLinks?.thumbnail && (
                <img
                  src={selected.volumeInfo.imageLinks.thumbnail}
                  alt={selected.volumeInfo.title}
                  className="w-full md:w-1/3 rounded-lg shadow-lg object-contain"
                />

              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">
                  {selected.volumeInfo.title}
                </h3>
                {selected.volumeInfo.subtitle && (
                  <p className="text-gray-400 text-sm mb-2">
                    {selected.volumeInfo.subtitle}
                  </p>
                )}
                {selected.volumeInfo.authors && (
                  <p className="text-gray-300 text-sm mb-4">
                    By {selected.volumeInfo.authors.join(", ")}
                  </p>
                )}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {selected.volumeInfo.description?.slice(0, 300) ||
                    "No description available."}
                  {selected.volumeInfo.description?.length > 300 && "..."}
                </p>

                <div className="mb-3">
                  <label className="block text-sm text-gray-400 mb-1">
                    Pages Read
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-gray-800 text-white p-2 rounded-lg w-24"
                    value={pageRead}
                    onChange={(e) => setPageRead(e.target.value)}
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-1">
                    Your Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full bg-gray-800 text-white p-2 rounded-lg resize-none"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Write your thoughts about this book..."
                  ></textarea>
                </div>

                {/* Status Selection */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-1">
                    Reading Status
                  </label>
                  <select
                    className="bg-gray-800 text-white p-2 rounded-lg w-full"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="reading">📖 Reading</option>
                    <option value="completed">✅ Completed</option>
                    <option value="paused">⏸️ Paused</option>
                    <option value="want-to-read">🕮 Want to Read</option>
                  </select>
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
