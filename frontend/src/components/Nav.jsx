import React, { useState } from "react";
import { Flame } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleForm } from "../redux/actions";

function Nav() {
  const [message, setMessage] = useState("Start your streak!");
  const streak = useSelector((state) => state.streak);
  const dispatch = useDispatch()

  const handlePlusClick = () => {
    dispatch(toggleForm())
  };

  return (
    <div className="flex justify-between items-center py-4 px-4 w-full bg-opacity-10 backdrop-blur-sm">
      {/* Streak Pill */}
      <div className="flex items-center justify-center p-3 rounded-xl border border-white border-opacity-20 text-white font-semibold flex-1 max-w-[150px]">
        <Flame size={20} className="mr-2" />
        <span>{streak}</span>
      </div>

      {/* Motivation Message Pill */}
      <div className="flex items-center justify-center p-3 rounded-xl border-b border-white border-opacity-20 text-white text-center text-sm font-medium flex-2 mx-4 bg-opacity-10 backdrop-blur-sm">
        <span>{message}</span>
      </div>

      {/* Plus Button Pill */}
      <button
        onClick={handlePlusClick}
        className="flex items-center justify-center p-3 rounded-xl border border-white border-opacity-20 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 hover:bg-white hover:bg-opacity-10 active:scale-95 hover:text-black flex-1 max-w-[150px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>
    </div>
  );
}

export default Nav;
