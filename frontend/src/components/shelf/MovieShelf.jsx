import React, { useEffect, useState } from "react";
import shelfApi from "../../api/ShelfCalls";
import ShelfItemViewer from "./ShelfItemViewer";
import { Loader2, Image as ImageIcon, CheckCircle, Star } from "lucide-react";

export default function MovieShelf({ shelf }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await shelfApi.getItemsByShelf(shelf._id);
        setItems(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [shelf]);

  const getMoviePoster = (data) => {
    // Try multiple possible keys
    return (
      data.poster ||
      data.poster_path ||
      data.backdrop ||
      data.backdrop_path ||
      data.cover ||
      null
    );
  };

  if (loading)
    return (
      <div className="flex justify-center text-gray-400 py-10">
        <Loader2 className="animate-spin mr-2" /> Loading movies...
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Movies</h2>

      {items.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          No movies added yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => {
            const poster = getMoviePoster(item.data);
            return (
              <div
                key={item._id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-transform flex flex-col"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative aspect-[3/4] w-full mb-3 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  {poster ? (
                    <img
                      src={
                        poster.startsWith("http")
                          ? poster
                          : `https://image.tmdb.org/t/p/w500${poster}`
                      }
                      alt={item.data.title || "Movie poster"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x600?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <p className="text-sm text-gray-500">No poster</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white line-clamp-1 flex-1">
                    {item.data.title || "Untitled"}
                  </h3>

                  <div className="flex items-center gap-1 ml-2">
                    {/* ✅ Watched indicator */}
                    {item.data.status === "completed" && (
                      <CheckCircle
                        size={16}
                        className="text-green-400 shrink-0"
                        title="Watched"
                      />
                    )}

                    {/* ⭐ User rating */}
                    {item.data.rating !== undefined && item.data.rating !== null && (
                      <div className="flex items-center text-yellow-400 text-sm font-medium shrink-0">
                        <Star size={14} className="mr-1 fill-yellow-400" />
                        {item.data.rating}
                      </div>
                    )}
                  </div>
                </div>

                {/* 📝 User notes preview */}
                {item.data.user_notes && (
                  <p className="text-gray-400 text-sm mt-1">
                    {item.data.user_notes.length > 150
                      ? item.data.user_notes.slice(0, 150) + "..."
                      : item.data.user_notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <ShelfItemViewer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
