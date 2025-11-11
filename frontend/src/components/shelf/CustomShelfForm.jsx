import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, PlusCircle } from "lucide-react";
import shelfApi from "../../api/ShelfCalls";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// 🌀 Only moves the *dragging item* to a portal (fixes offset without hiding new fields)
function PortalAwareDraggable({ children, provided, snapshot }) {
  const child = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        zIndex: snapshot.isDragging ? 9999 : "auto",
      }}
      className={`flex flex-col md:flex-row gap-2 mb-3 bg-gray-800/40 p-3 rounded-lg transition-all ${
        snapshot.isDragging
          ? "ring-2 ring-teal-500 shadow-lg scale-[1.02]"
          : "hover:bg-gray-800/60"
      }`}
    >
      {children}
    </div>
  );

  if (snapshot.isDragging) {
    return ReactDOM.createPortal(child, document.body);
  }
  return child;
}

export default function CustomShelfForm({ onClose }) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState([{ key: "", type: "text", required: false }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 Add new field
  const addField = () =>
    setFields((prev) => [...prev, { key: "", type: "text", required: false }]);

  // 🚀 Reorder fields
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newFields = Array.from(fields);
    const [moved] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, moved);
    setFields(newFields);
  };

  // 💾 Create shelf
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Shelf name is required");
    if (fields.some((f) => !f.key.trim()))
      return setError("All field names must be filled");

    try {
      setLoading(true);
      await shelfApi.createShelf({ name, schema: fields });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Failed to create shelf. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl w-[90%] max-w-lg relative text-white shadow-2xl"
        style={{ transform: "none" }} // Prevent drag offset
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Create Custom Shelf</h2>

        {/* Error Banner */}
        {error && (
          <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-3">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          {/* Shelf Name */}
          <input
            className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Shelf Name (e.g. Games, Gadgets, Recipes)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Fields Builder */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {fields.map((field, idx) => (
                    <Draggable key={idx} draggableId={String(idx)} index={idx}>
                      {(provided, snapshot) => (
                        <PortalAwareDraggable
                          provided={provided}
                          snapshot={snapshot}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="cursor-grab text-gray-500 select-none">
                              ⋮⋮
                            </span>

                            {/* Field name input */}
                            <input
                              placeholder="Field Name"
                              className="flex-1 bg-gray-900 text-white p-2 rounded"
                              value={field.key}
                              onChange={(e) =>
                                setFields((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, key: e.target.value }
                                      : x
                                  )
                                )
                              }
                            />

                            {/* Field type */}
                            <select
                              value={field.type}
                              className="bg-gray-900 text-white p-2 rounded w-32"
                              onChange={(e) =>
                                setFields((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, type: e.target.value }
                                      : x
                                  )
                                )
                              }
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="photo">Photo</option>
                              <option value="boolean">Boolean</option>
                              <option value="date">Date</option>
                              <option value="url">URL</option>
                              <option value="array">Array</option>
                            </select>

                            {/* Required toggle */}
                            <label className="flex items-center gap-1 text-gray-300 text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  setFields((prev) =>
                                    prev.map((x, i) =>
                                      i === idx
                                        ? {
                                            ...x,
                                            required: e.target.checked,
                                          }
                                        : x
                                    )
                                  )
                                }
                              />
                              Required
                            </label>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() =>
                                setFields((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-red-400 hover:text-red-500 font-bold text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </PortalAwareDraggable>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Field */}
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition self-start"
          >
            <PlusCircle size={18} />
            Add Field
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 py-2 rounded text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Shelf"}
          </button>
        </form>
      </div>
    </div>
  );
}
