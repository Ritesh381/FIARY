import React, { useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Calendar,
    MapPin,
    Tag,
    Edit3,
    Trash2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleEditModal, deleteMemory } from "../../redux/slices/memoriesSlice";

export default function MemoryViewer({ memory, onClose }) {
    const dispatch = useDispatch();
    const [photoIndex, setPhotoIndex] = useState(0);

    if (!memory) return null;

    const photos = memory.photos || [];

    const handleNext = () => {
        setPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrev = () => {
        setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this memory?")) {
            await dispatch(deleteMemory(memory._id));
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-gray-900/90 text-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full bg-gray-800 hover:bg-gray-700"
                >
                    <X size={20} />
                </button>

                {/* Photo Viewer */}
                <div className="relative aspect-video bg-black flex items-center justify-center">
                    {photos.length > 0 ? (
                        <a
                            href={photos[photoIndex]}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-full"
                            title="Click to open full image"
                        >
                            <img
                                src={photos[photoIndex]}
                                alt={`Memory ${photoIndex + 1}`}
                                className="w-full h-full object-contain cursor-pointer"
                            />
                        </a>
                    ) : (
                        <div className="text-gray-500 text-lg">No Photos Available</div>
                    )}

                    {/* Navigation Buttons */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrev();
                                }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>


                {/* Details Section */}
                <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold">{memory.title}</h2>

                    <div className="flex items-center gap-3 text-gray-300 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                            <Calendar size={16} className="text-blue-400" />
                            <span>{new Date(memory.date).toLocaleDateString()}</span>
                        </div>
                        {memory.location && (
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="text-blue-400" />
                                <span>{memory.location}</span>
                            </div>
                        )}
                    </div>

                    {memory.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {memory.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/50 text-blue-300"
                                >
                                    <Tag size={14} className="mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {memory.description && (
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {memory.description}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => {
                                dispatch(toggleEditModal(memory));
                                onClose();
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Edit3 size={16} />
                            Edit
                        </button>

                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
