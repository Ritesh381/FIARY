import React, { useState, useRef } from "react";
import {
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function CustomItemView({ schema = [], data, editable, setData }) {
  const fileRefs = useRef({});
  const photoFields = schema.filter((f) => f.type === "photo");
  const [photoIndex, setPhotoIndex] = useState(0);

  // Extract only valid photos
  const photos = photoFields
    .map((f) => ({ key: f.key, src: data?.[f.key] }))
    .filter((p) => typeof p.src === "string" && p.src.trim() !== "");

  const handlePhotoUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setData((prev) => ({ ...prev, [key]: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = (key) => {
    setData((prev) => ({ ...prev, [key]: "" }));
  };

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const nextPhoto = () => setPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const renderField = (field) => {
    const { key, type, required } = field;
    const value = data?.[key] ?? "";

    if (editable) {
      switch (type) {
        case "text":
        case "url":
        case "date":
        case "number":
          return (
            <input
              type={type === "number" ? "number" : type === "date" ? "date" : "text"}
              className="w-full bg-[#1C1F26] p-2 rounded-lg text-gray-200 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none mt-1"
              value={value}
              required={required}
              placeholder={`Enter ${key.replace(/_/g, " ")}`}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          );

        case "boolean":
          return (
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleChange(key, e.target.checked)}
                className="accent-teal-500 scale-110"
              />
              <span className="capitalize text-gray-300">{key.replace(/_/g, " ")}</span>
            </label>
          );

        case "photo":
          return (
            <div className="flex items-center gap-3 mt-2">
              <input
                type="file"
                accept="image/*"
                ref={(el) => (fileRefs.current[key] = el)}
                onChange={(e) => handlePhotoUpload(key, e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRefs.current[key]?.click()}
                className="bg-teal-700 hover:bg-teal-600 px-3 py-2 rounded-lg text-sm text-white flex items-center gap-1 transition"
              >
                <ImageIcon size={16} /> Upload
              </button>

              {value && (
                <div className="relative">
                  <img
                    src={value}
                    alt={key}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(key)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          );

        case "array":
          return (
            <EditableArrayInput
              keyName={key}
              values={Array.isArray(value) ? value : []}
              setData={setData}
            />
          );

        default:
          return (
            <input
              type="text"
              className="w-full bg-[#1C1F26] p-2 rounded-lg text-gray-200 border border-gray-700 focus:ring-2 focus:ring-teal-500 mt-1"
              value={value || ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          );
      }
    }

    // View mode
    const clickable =
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"));

    // Hide photo field if it's already shown in the left section
    if (type === "photo" && photos.find((p) => p.key === key)) return null;

    switch (type) {
      case "boolean":
        return (
          <span className="text-gray-300 ml-2">{value ? "✅ Yes" : "❌ No"}</span>
        );

      case "url":
        return clickable ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:text-teal-300 flex items-center gap-1 ml-2"
          >
            <ExternalLink size={16} /> Visit Page
          </a>
        ) : (
          <span className="text-gray-500 ml-2">{value || "No link provided"}</span>
        );

      case "array":
        return (
          <span className="ml-2 flex flex-wrap gap-2">
            {Array.isArray(value) && value.length > 0 ? (
              value.map((v, i) => (
                <span
                  key={i}
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-200"
                >
                  {v}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No entries</span>
            )}
          </span>
        );

      default:
        if (clickable) {
          return (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline break-all ml-2"
            >
              {value}
            </a>
          );
        }
        return <span className="text-gray-300 ml-2">{value?.toString() || "—"}</span>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-[#0F1117] p-6 rounded-xl border border-gray-800 shadow-lg">
      {/* Left Image Section */}
      {!editable && photos.length > 0 && (
        <div className="relative w-full md:w-1/3 flex items-center justify-center rounded-lg p-3">
          <img
            src={photos[photoIndex].src}
            alt={`Image ${photoIndex + 1}`}
            className="rounded-lg shadow-md w-full h-72 object-contain"
          />
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Right Info Section */}
      <div className="flex-1 space-y-3">
        {schema.map((field) => {
          const isPhotoShown =
            field.type === "photo" &&
            photos.find((p) => p.key === field.key) &&
            !editable;

          // Hide if photo already shown on left
          if (isPhotoShown) return null;

          return (
            <div key={field.key} className="flex items-center flex-wrap">
              <strong className="capitalize text-teal-400">
                {field.key.replace(/_/g, " ")}:
              </strong>
              {renderField(field)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 🧩 Editable Array Input */
function EditableArrayInput({ keyName, values, setData }) {
  const [input, setInput] = React.useState("");
  const [editIndex, setEditIndex] = React.useState(null);

  const handleAddOrEdit = () => {
    if (!input.trim()) return;
    setData((prev) => {
      const arr = Array.isArray(prev[keyName]) ? [...prev[keyName]] : [];
      if (editIndex !== null) arr[editIndex] = input;
      else arr.push(input);
      return { ...prev, [keyName]: arr };
    });
    setInput("");
    setEditIndex(null);
  };

  const handleRemove = (index) => {
    setData((prev) => ({
      ...prev,
      [keyName]: prev[keyName].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOrEdit())}
          placeholder="Add value..."
          className="flex-1 p-2 bg-[#1C1F26] text-gray-200 rounded-lg border border-gray-700 focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button
          type="button"
          onClick={handleAddOrEdit}
          className="bg-teal-600 hover:bg-teal-500 px-3 py-2 rounded-lg text-sm text-white"
        >
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-200"
          >
            <span
              onClick={() => (setInput(v), setEditIndex(i))}
              className="cursor-pointer hover:text-teal-400 transition"
            >
              {v}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="text-red-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
