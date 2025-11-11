import React, { useEffect, useState } from "react";
import shelfApi from "../../api/ShelfCalls";
import ShelfItemViewer from "./ShelfItemViewer";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function BookShelf({ shelf }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await shelfApi.getItemsByShelf(shelf._id);
        setItems(data);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [shelf]);

  const getBookCover = (data) => {
    // Check for possible field variations in book data
    return (
      data.cover_image ||
      data.coverImage ||
      data.cover ||
      data.thumbnail ||
      data.image ||
      null
    );
  };

  if (loading)
    return (
      <div className="flex justify-center text-gray-400 py-10">
        <Loader2 className="animate-spin mr-2" /> Loading books...
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Books</h2>

      {items.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          No books added yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => {
            const cover = getBookCover(item.data);
            return (
              <div
                key={item._id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-transform flex flex-col"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative aspect-[3/4] w-full mb-3 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  {cover ? (
                    <img
                      src={cover}
                      alt={item.data.title || "Book cover"}
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
                      <p className="text-sm text-gray-500">No cover</p>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {item.data.title || "Untitled"}
                </h3>
                {item.data.user_notes && (
                  <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                    {item.data.user_notes}
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
