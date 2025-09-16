import React, { useState } from "react";
import { Flame } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSaveForm } from "../redux/slices/formSlice";

function Nav() {
  const message = useSelector((state) => state.streak.message);
  const streak = useSelector((state) => state.streak.value);
  const dispatch = useDispatch();

  const handlePlusClick = () => {
    dispatch(toggleSaveForm());
  };

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

    {/* Plus Button Pill */}
    <button
      onClick={handlePlusClick}
      className="
        flex items-center justify-center
        rounded-xl border border-white border-opacity-20
        text-white font-semibold
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
        transition-all duration-200
        hover:bg-white hover:bg-opacity-10 active:scale-95 hover:text-black
        shrink-1 grow max-w-[30%] min-w-0
        py-[2vw] px-[2vw] sm:py-3 sm:px-4
        ml-[2vw] sm:ml-4
        bg-opacity-10 backdrop-blur-sm
        max-w-[50px]
      "
      style={{ fontSize: 'clamp(10px, 3vw, 15px)' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-[5vw] w-[5vw] min-h-[22px] min-w-[22px] max-h-[28px] max-w-[28px]"
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
