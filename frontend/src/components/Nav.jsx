import React, { useState, useRef, useEffect } from "react";
import { Flame, UserCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSaveForm } from "../redux/slices/formSlice";
import { useNavigate } from "react-router-dom";
import api from "../api/AuthCalls";

function Nav() {
  const message = useSelector((state) => state.streak.message);
  const streak = useSelector((state) => state.streak.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handlePlusClick = () => {
    dispatch(toggleSaveForm());
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.signOut(dispatch);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
  <div className="flex justify-between items-center py-3 px-2 sm:py-4 sm:px-4 w-full "
       style={{ minWidth: 0 }}>
    {/* Streak Pill */}
    <div
      className="
        flex items-center justify-center
        rounded-xl border border-white border-opacity-10
        text-orange-300 font-semibold
        shrink-1 grow max-w-[20%] lg:max-w-[7%]
        text-[6vw] xs:text-[7vw] sm:text-[4vw] md:text-[1.2vw] lg:text-[15px]
        py-[2vw] px-[2vw] sm:py-3 sm:px-4
        mr-[2vw] sm:mr-4
      "
      style={{ fontSize: 'clamp(10px, 3vw, 15px)' }}
    >
      <Flame size={18} className="mr-1 sm:mr-2" />
      <span>{streak}</span>
    </div>

    {/* Motivation Message Pill */}
    <div
      className="
        flex-1 min-w-0
        flex items-center justify-center
        rounded-xl border-b border-white border-opacity-20
        text-white text-center font-medium
        mx-[2vw] sm:mx-4
        bg-opacity-10 backdrop-blur-sm
        text-[6vw] xs:text-[7vw] sm:text-[4vw] md:text-[1.2vw] lg:text-[15px]
        py-[2vw] px-[2vw] sm:py-3 sm:px-4
        bg-opacity-10 backdrop-blur-sm
      "
      style={{ fontSize: 'clamp(9px, 3vw, 15px)' }}
    >
      <span className="w-full" dangerouslySetInnerHTML={{ __html: message }} />
    </div>

    {/* Profile Menu */}
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="
          flex items-center justify-center
          rounded-full border border-white border-opacity-20
          text-white
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
          transition-all duration-200
          hover:bg-white hover:bg-opacity-10 active:scale-95
          shrink-0 h-[48px] w-[48px]
          bg-opacity-10 backdrop-blur-sm
          ml-[2vw] sm:ml-4
        "
      >
        <UserCircle size={28} />
      </button>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg border border-white border-opacity-20 z-20 overflow-hidden backdrop-blur-md"
        >
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
);

}

export default Nav;
