import React, { useEffect } from "react";
import {
  Plus,
  MapPin,
  Calendar,
  Tag,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMemories,
  toggleAddModal,
  toggleEditModal,
} from "../redux/slices/memoriesSlice";
import MemoryForm from "../components/memories/MemoryForm";
import { setNavItems } from "../redux/slices/NavItems";

// Glass Card Component (reused pattern)
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/10 ${className}`}
  >
    {children}
  </div>
);

export default function Memories() {
  const dispatch = useDispatch();
  const {
    items: memories,
    status,
    error,
    isAddModalOpen,
    isEditModalOpen,
    selectedMemory,
  } = useSelector((state) => state.memories);

  // Load memories on component mount
  useEffect(() => {
    dispatch(fetchMemories());
  }, [dispatch]);
  useEffect(() => {
    if (status === "succeeded" || status === "idle") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [status]);

  useEffect(() => {
    dispatch(
      setNavItems([
        { type: "text", content: "The Memories you make along your life" },
      ])
    );
  }, [dispatch]);

  // Memory Card Component
  const MemoryCard = ({ memory }) => (
    <GlassCard className="h-full transition-transform hover:-translate-y-1">
      <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
        {memory.photos?.[0] ? (
          <img
            src={memory.photos[0]}
            alt={memory.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{memory.title}</h3>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-teal-400" />
          <span>{new Date(memory.date).toLocaleDateString()}</span>
        </div>

        {memory.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-teal-400" />
            <span>{memory.location}</span>
          </div>
        )}

        {memory.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {memory.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-900/50 text-teal-300"
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-400 line-clamp-2 mt-2">{memory.description}</p>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => dispatch(toggleEditModal(memory))}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={() => handleDelete(memory._id)}
          className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </GlassCard>
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading memories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-400 bg-red-900/20 p-4 rounded-lg">
          <AlertTriangle size={24} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto my-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Memories</h1>
          <button
            onClick={() => dispatch(toggleAddModal())}
            className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            <span>Add Memory</span>
          </button>
        </div>

        {/* Memory Grid */}
        {memories.length === 0 ? (
          <GlassCard className="text-center py-12">
            <ImageIcon size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">No memories yet</h3>
            <p className="text-gray-400">
              Start capturing your precious moments by clicking the "Add Memory"
              button.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <MemoryCard key={memory._id} memory={memory} />
            ))}
          </div>
        )}
      </div>

      {/* Add the modals */}
      {isAddModalOpen && (
        <MemoryForm onClose={() => dispatch(toggleAddModal())} />
      )}

      {isEditModalOpen && selectedMemory && (
        <MemoryForm
          memory={selectedMemory}
          onClose={() => dispatch(toggleEditModal(null))}
        />
      )}
    </div>
  );
}
