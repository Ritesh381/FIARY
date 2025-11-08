import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { X, Image as ImageIcon, Loader2, MapPin, Calendar, Tag as TagIcon, Plus } from 'lucide-react';
import { createMemory, updateMemory } from '../../redux/slices/memoriesSlice';

export default function MemoryForm({ memory = null, onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: memory?.title || '',
    description: memory?.description || '',
    date: memory?.date ? new Date(memory.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    location: memory?.location || '',
  });

  const [tags, setTags] = useState(memory?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState(memory?.photos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Location handler
  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            location: data.display_name || `${position.coords.latitude}, ${position.coords.longitude}`
          }));
        } catch (error) {
          console.error("Error fetching location:", error);
        } finally {
          setIsLocating(false);
        }
      }, (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
      });
    }
  };

  // Tag handlers
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault(); // Prevent form submission
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const submitData = new FormData();

  // Append regular text fields
  Object.keys(formData).forEach(key => {
    submitData.append(key, formData[key]);
  });

  // ✅ Append tags properly
  submitData.append('tags', JSON.stringify(tags));

  // Append photos
  files.forEach(file => {
    submitData.append('photos', file);
  });

  try {
    if (memory?._id) {
      await dispatch(updateMemory({ id: memory._id, formData: submitData })).unwrap();
    } else {
      await dispatch(createMemory(submitData)).unwrap();
    }
    onClose();
  } catch (error) {
    console.error('Submit failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};


  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    const newPreviews = [...previews];
    const newFiles = [...files];
    
    URL.revokeObjectURL(previews[index]);
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setPreviews(newPreviews);
    setFiles(newFiles);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm z-50" 
         onClick={handleBackdropClick}>
      <div className="bg-gray-800/90 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {memory ? 'Edit Memory' : 'Create New Memory'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
              placeholder="A title for your memory..."
              required
            />
          </div>

          {/* Date Input */}
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="bg-gray-700/50 rounded-lg px-4 py-2 text-white flex-1"
              required
            />
          </div>

          {/* Location Input with Get Location Button */}
          <div className="flex items-center gap-2">
            <MapPin className="text-gray-400" size={20} />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Location"
              className="bg-gray-700/50 rounded-lg px-4 py-2 text-white flex-1"
            />
            <button
              type="button"
              onClick={handleGetLocation}
              className="p-2 bg-blue-600/50 hover:bg-blue-500/50 rounded-lg transition-colors"
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TagIcon className="text-gray-400" size={20} />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag and press Enter"
                className="bg-gray-700/50 rounded-lg px-4 py-2 text-white flex-1"
              />
            </div>
            
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-900/50 text-blue-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white h-24 resize-none"
              placeholder="Tell the story behind this memory..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="border-2 border-dashed border-gray-600 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-400 mt-2">Add Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Memory'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
