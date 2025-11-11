import React, { useState } from "react";
import { X, Edit3, Trash2, Check, Star, ExternalLink, Clock, CheckCircle, BookOpen } from "lucide-react";
import shelfApi from "../../api/ShelfCalls";
import ReactMarkdown from "react-markdown";
import CustomItemView from "./CustomItemView";

const BookItemView = ({ data, editable, setData }) => {
  // Choose the best available book cover
  const coverSrc =
    data.cover_image ||
    data.thumbnail ||
    data.smallThumbnail ||
    data.image ||
    null;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Book Cover */}
      {coverSrc && (
        <img
          src={coverSrc}
          alt={data.title || "Book cover"}
          className="w-full md:w-1/3 rounded-lg shadow-md object-contain h-72"
        />
      )}

      {/* Right: Details */}
      <div className="flex-1 space-y-3">
        {/* Title + External Link */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-3xl font-bold text-white">
            {data.title || "Untitled"}
          </h2>
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <ExternalLink size={16} />
              Visit Page
            </a>
          )}
        </div>

        {/* Publish info */}
        {data.publish_date && (
          <p className="text-gray-400 text-sm">
            <strong>Published:</strong> {data.publish_date}
          </p>
        )}

        {/* Truncated Description */}
        {data.description && (
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
            <ReactMarkdown>
              {data.description.length > 500
                ? data.description.slice(0, 500) + "..."
                : data.description}
            </ReactMarkdown>
          </div>
        )}

        {/* Reading Status */}
        <div>
          <strong className="block mb-1 text-teal-400">Status:</strong>
          {editable ? (
            <select
              className="bg-gray-800 p-2 rounded-lg text-white"
              value={data.status || "reading"}
              onChange={(e) =>
                setData((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="reading">📖 Reading</option>
              <option value="completed">✅ Completed</option>
              <option value="paused">⏸️ Paused</option>
              <option value="want-to-read">🕮 Want to Read</option>
            </select>
          ) : (
            <p
              className={`text-gray-300 bg-gray-800/60 p-2 rounded-lg inline-block capitalize ${data.status === "completed"
                  ? "text-green-400"
                  : data.status === "paused"
                    ? "text-yellow-400"
                    : data.status === "want-to-read"
                      ? "text-blue-400"
                      : "text-teal-400"
                }`}
            >
              {data.status?.replace("-", " ") || "Reading"}
            </p>

          )}
        </div>


        {/* Pages read */}
        <div>
          <strong className="block mb-1 text-teal-400">Reading Progress:</strong>
          {editable ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="0"
                className="bg-gray-800 p-2 rounded-lg text-white w-24"
                value={data.page_read || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    page_read: e.target.value,
                  }))
                }
              />
              <span className="text-gray-400 text-sm">
                / {data.page_count || "?"} pages
              </span>
            </div>
          ) : (
            <p className="text-gray-300 bg-gray-800/60 p-2 rounded-lg inline-block">
              {data.page_read || 0}/{data.page_count || "?"} pages read
            </p>
          )}
        </div>


        {/* User Notes */}
        <div>
          <strong className="block mb-1 text-teal-400">Your Notes:</strong>
          {editable ? (
            <textarea
              className="w-full bg-gray-800 p-2 rounded-lg text-white"
              value={data.user_notes || ""}
              onChange={(e) =>
                setData((prev) => ({ ...prev, user_notes: e.target.value }))
              }
              placeholder="Write your thoughts about this book..."
            />
          ) : (
            <p className="text-gray-200 bg-gray-800/60 p-2 rounded-lg">
              {data.user_notes || "No notes yet"}
            </p>
          )}
        </div>

        {/* Rating (Editable) */}
        <div>
          <strong className="block mb-1 text-teal-400">Rating (0–5):</strong>
          {editable ? (
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              placeholder="0"
              className="bg-gray-800 p-2 rounded-lg text-white w-24"
              value={data.rating || ""}
              onChange={(e) =>
                setData((prev) => ({ ...prev, rating: e.target.value }))
              }
            />
          ) : data.rating ? (
            <p className="text-yellow-400 flex items-center gap-1">
              <Star size={16} /> {data.rating}/5
            </p>
          ) : (
            <p className="text-gray-400">No rating yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MovieItemView = ({ data, editable, setData }) => (
  <div className="flex flex-col md:flex-row gap-6">
    {/* Poster */}
    {data.poster && (
      <img
        src={data.poster}
        alt={data.title}
        className="w-full md:w-1/3 rounded-lg shadow-md object-contain"
      />
    )}

    {/* Details */}
    <div className="flex-1 space-y-3">
      {/* Title + Link */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-3xl font-bold text-white">{data.title}</h2>
        <a
          href={`https://movie-hub404.vercel.app/info?id=${data.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
        >
          <ExternalLink size={16} />
          Visit Page
        </a>
      </div>

      {/* Release Date */}
      {data.release && (
        <p className="text-gray-400">
          <strong>Released:</strong> {data.release}
        </p>
      )}

      {/* Overview */}
      {data.overview && (
        <p className="text-gray-300 text-sm leading-relaxed">
          {data.overview}
        </p>
      )}

      {/* ✅ Watched Checkbox / Tag */}
      <div className="mt-2">
        <strong className="block mb-1 text-teal-400">Status:</strong>
        {editable ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.status === "completed" || data._status === "completed"}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  status: e.target.checked ? "completed" : "watchlist", // ✅ updates top-level
                  data: {
                    ...prev.data,
                    status: undefined,
                  },
                }))
              }
              className="w-4 h-4 accent-teal-500"
            />
            <span className="text-gray-300">Watched</span>
          </label>
        ) : data.status === "completed" ? (
          <span className="flex items-center gap-1 text-green-400 font-medium">
            <CheckCircle size={16} /> Watched
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-400 font-medium">
            <Clock size={16} /> WatchList
          </span>
        )}
      </div>


      {/* 📝 Notes */}
      <div>
        <strong className="block mb-1 text-teal-400">Your Notes:</strong>
        {editable ? (
          <textarea
            className="w-full bg-gray-800 p-2 rounded-lg text-white"
            value={data.user_notes || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, user_notes: e.target.value }))
            }
          />
        ) : (
          <p className="text-gray-200 bg-gray-800/60 p-2 rounded-lg">
            {data.user_notes || "No notes yet"}
          </p>
        )}
      </div>

      {/* ⭐ Rating */}
      <div>
        <strong className="block mb-1 text-teal-400">Rating (0–5):</strong>
        {editable ? (
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            className="bg-gray-800 p-2 rounded-lg text-white w-24"
            value={data.rating || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, rating: e.target.value }))
            }
          />
        ) : data.rating ? (
          <p className="text-yellow-400 flex items-center gap-1">
            <Star size={16} className="fill-yellow-400" /> {data.rating}/5
          </p>
        ) : null}
      </div>
    </div>
  </div>
);

export default function ShelfItemViewer({ item, onClose }) {
  const [data, setData] = useState(item.data);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await shelfApi.updateItem(item._id, { data });
      setEditable(false);
    } catch (err) {
      alert("Failed to update item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await shelfApi.deleteItem(item._id);
      onClose();
      window.location.reload();
    } catch (err) {
      alert("Failed to delete item");
      console.error(err);
    }
  };

  const renderView = () => {
    if (item.type === "book")
      return <BookItemView data={data} editable={editable} setData={setData} />;

    if (item.type === "movie")
      return <MovieItemView data={data} editable={editable} setData={setData} />;

    // ✅ Custom shelf — pass schema too
    return (
      <CustomItemView
        schema={item.schema || item.shelfSchema || []}
        data={data || {}}
        editable={editable}
        setData={setData}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-xl w-[90%] max-w-4xl relative text-white overflow-y-auto max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Item Details</h2>

          <div className="flex gap-2">
            {editable ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-500 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Check size={16} /> Save
              </button>
            ) : (
              <button
                onClick={() => setEditable(true)}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Edit3 size={16} /> Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white bg-gray-700/40 px-3 py-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        {renderView()}
      </div>
    </div>
  );
}