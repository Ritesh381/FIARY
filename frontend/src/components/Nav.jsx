import React, { useState, useRef, useEffect, use } from "react";
import { Flame, UserCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/AuthCalls";

function Nav() {
  const message = useSelector((state) => state.streak.message);
  const streak = useSelector((state) => state.streak.value);
  const navItems = useSelector((state) => state.nav.items);
  const user = useSelector((state) => state.user.user);
  console.log(user)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  const handleSettingClick = () => {
    navigate("/settings");
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Determine selected link based on query param ---
  const query = new URLSearchParams(location.search);
  const currentPage = query.get("page");

  const getSelectedLink = () => {
    if (!navItems || navItems.length === 0) return null;
    if (currentPage) {
      return navItems.find((item) => {
        const linkPage = new URLSearchParams(item.link.split("?")[1]).get("page");
        return linkPage === currentPage;
      })?.id;
    }
    return navItems[0]?.id;
  };

  const selectedId = getSelectedLink();

  return (
    <div
      className="flex justify-between items-center w-full fixed top-0 left-0 px-3 pt-1 sm:pt-3 sm:px-6 bg-transparent z-30"
      style={{ backdropFilter: "blur(6px)" }}
    >
      {/* --- Streak Pill --- */}
      <div
        className="flex items-center justify-center rounded-full px-3 sm:px-4 py-1 sm:py-2
        text-orange-400 font-semibold border border-orange-400/20 bg-orange-500/10 shadow-sm
        text-[13px] sm:text-[15px] cursor-default select-none"
      >
        <Flame size={16} className="mr-1 sm:mr-2 text-orange-400" />
        <span>{streak}</span>
      </div>

      {/* --- Center Section (Text or Links) --- */}
      <div className="flex justify-center items-center text-white font-medium text-sm sm:text-base">
        {navItems.length > 0 ? (
          navItems[0].type === "text" ? (
            <span
              className="px-3 py-1 sm:py-2 text-center whitespace-nowrap"
              dangerouslySetInnerHTML={{ __html: navItems[0].content }}
            />
          ) : (
            <div className="flex justify-center items-center gap-3 sm:gap-6">
              {navItems.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <button
                    onClick={() => navigate(item.link)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all duration-200
                      ${
                        selectedId === item.id
                          ? "bg-white/10 shadow-md border border-white/10 text-white"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {item.name}
                  </button>
                  {index !== navItems.length - 1 && (
                    <span className="text-gray-500 text-sm select-none">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )
        ) : (
          <span className="text-gray-400 italic">Nothing to show</span>
        )}
      </div>

      {/* --- Profile Menu --- */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center rounded-full border border-white border-opacity-20
          text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200
          hover:bg-white hover:bg-opacity-10 active:scale-95 shrink-0 h-[42px] w-[42px]
          bg-opacity-10 backdrop-blur-sm"
        >
          {user?.profilePic ? <img
      src={user.profilePic}
      alt="Profile"
      className="h-full w-full object-cover rounded-full"
    /> : <UserCircle size={24} />}
        </button>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-44 bg-gray-800 rounded-xl shadow-lg border border-white border-opacity-20 z-20 overflow-hidden backdrop-blur-md"
          >
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200"
            >
              Profile
            </button>
            <button
              onClick={handleSettingClick}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200"
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
