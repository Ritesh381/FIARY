import React, { useState, useRef } from "react";
import { X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import shelfApi from "../../api/ShelfCalls";

export default function CustomShelfItemForm({ shelf, onClose }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRefs = useRef({});

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrayAdd = (key, value) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), value],
    }));
  };

  const handleArrayRemove = (key, index) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleArrayEdit = (key, index, newValue) => {
    setFormData((prev) => {
      const arr = [...(prev[key] || [])];
      arr[index] = newValue;
      return { ...prev, [key]: arr };
    });
  };

  const handlePhotoUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange(key, e.target.result); // base64 encoded
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        shelfId: shelf._id,
        type: "custom",
        data: formData,
      };
      await shelfApi.createItem(payload);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error creating item:", err);
      alert("Failed to create item. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field) => {
    const { key, type, required } = field;
    const value = formData[key] || "";

    switch (type) {
      case "text":
      case "number":
      case "url":
      case "date":
        return (
          <input
            type={type === "number" ? "number" : type === "date" ? "date" : "text"}
            required={required}
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            placeholder={`Enter ${key}`}
          />
        );

      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(key, e.target.checked)}
            />
            <span>{key}</span>
          </label>
        );

      case "photo":
        return (
          <div className="flex items-center gap-4">
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
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <ImageIcon size={18} />
              Upload Image
            </button>
            {value && (
              <img
                src={value}
                alt="preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-700"
              />
            )}
          </div>
        );

      case "array":
        return (
          <ArrayInput
            label={key}
            values={formData[key] || []}
            onAdd={(val) => handleArrayAdd(key, val)}
            onRemove={(i) => handleArrayRemove(key, i)}
            onEdit={(i, val) => handleArrayEdit(key, i, val)}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            placeholder={`Enter ${key}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-xl w-[90%] max-w-2xl relative text-white overflow-y-auto max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Add Item to {shelf.name}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {shelf.schema?.map((field, i) => (
            <div key={i}>
              <label className="block text-sm mb-1 text-teal-400 font-semibold capitalize">
                {field.key} {field.required && <span className="text-red-400">*</span>}
              </label>
              {renderInput(field)}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* 🧩 Array Input Component */
function ArrayInput({ label, values, onAdd, onRemove, onEdit }) {
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const handleAddOrEdit = () => {
    if (editIndex !== null) {
      onEdit(editIndex, input);
      setEditIndex(null);
    } else {
      onAdd(input);
    }
    setInput("");
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOrEdit())}
          placeholder={`Add ${label}...`}
          className="flex-1 p-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={handleAddOrEdit}
          className="bg-teal-600 hover:bg-teal-500 px-3 py-2 rounded-lg"
        >
          {editIndex !== null ? "Update" : <Plus size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-600"
          >
            <span onClick={() => (setInput(v), setEditIndex(i))}>{v}</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
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
