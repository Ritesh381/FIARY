import React, { useEffect, useState } from "react";
import shelfApi from "../../api/ShelfCalls";
import ShelfItemViewer from "./ShelfItemViewer";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function CustomShelf({ shelf }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomItems = async () => {
      try {
        const data = await shelfApi.getItemsByShelf(shelf._id);
        setItems(data || []);
      } catch (err) {
        console.error("Error fetching custom items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomItems();
  }, [shelf]);

  if (loading)
    return (
      <div className="flex justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading {shelf.name}...
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{shelf.name}</h2>

      {items.length === 0 ? (
        <div className="text-gray-400">No items added yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const imageKey =
              Object.keys(item.data).find(
                (k) =>
                  k.toLowerCase().includes("photo") ||
                  k.toLowerCase().includes("image") ||
                  k.toLowerCase().includes("cover")
              ) || null;

            const titleKey =
              Object.keys(item.data).find(
                (k) =>
                  k.toLowerCase().includes("title") ||
                  k.toLowerCase().includes("name")
              ) || null;

            return (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 cursor-pointer hover:-translate-y-1 transition-transform"
              >
                {imageKey && item.data[imageKey] &&
                  <img
                    src={item.data[imageKey]}
                    alt={item.data[titleKey] || "Custom Item"}
                    className="w-full h-full object-contain rounded-lg mb-3"
                  />
                }

                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {item.data[titleKey] || "Untitled"}
                </h3>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <ShelfItemViewer
          item={{ ...selectedItem, schema: shelf.schema }} // ✅ Pass schema explicitly
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
