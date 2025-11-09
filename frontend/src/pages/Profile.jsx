import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setNavItems } from "../redux/slices/NavItems";
import { Loader2, Edit3 } from "lucide-react";
import userApi from "../api/UserCalls";

export default function Profile() {
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    bio: "",
    profilePic: "",
  });
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChanged, setIsChanged] = useState(false);
  const fileInputRef = useRef(null);

  // Set nav items on load
  useEffect(() => {
    dispatch(
      setNavItems([
        { id: 0, type: "link", name: "Profile", link: "/profile" },
        { id: 1, type: "link", name: "Preferences", link: "/profile?page=1" },
      ])
    );
  }, [dispatch]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userApi.getUser(dispatch);
        setUser(data);
        setForm({
          name: data.name || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          bio: data.bio || "",
          profilePic: data.profilePic || "",
        });
        setPreview(data.profilePic || "");
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Discard them?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isChanged]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsChanged(true);
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      setFile(newFile);
      setPreview(URL.createObjectURL(newFile));
      setIsChanged(true);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("dob", form.dob);
      formData.append("bio", form.bio);
      if (file) formData.append("profilePic", file);

      await userApi.updateUser(formData);
      setIsChanged(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save changes.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 text-white px-4">
      {/* Top Section: Picture + Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Profile Picture */}
        <div className="flex flex-col items-center justify-center md:items-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-700">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                No Image
              </div>
            )}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-full"
              title="Edit profile picture"
            >
              <Edit3 size={16} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="w-full bg-gray-800/70 rounded-lg px-4 py-2 text-white"
              placeholder="Your name"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleInputChange}
              className="w-full bg-gray-800/70 rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <a
              href="/change-password"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Change Password
            </a>
            <a
              href="/change-email"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Change Email
            </a>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mb-8 relative">
        <label className="block text-sm text-gray-400 mb-2">Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={(e) => {
            if (e.target.value.length <= 500) handleInputChange(e);
          }}
          className="w-full bg-gray-800/70 rounded-lg px-4 py-3 text-white resize-none h-32"
          placeholder="Tell something about yourself..."
          maxLength={500}
        />
        <div className="absolute bottom-2 right-3 text-xs text-gray-400">
          {form.bio.length}/500
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          disabled={!isChanged}
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isChanged
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
