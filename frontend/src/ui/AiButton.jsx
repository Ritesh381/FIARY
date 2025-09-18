import React from "react";
import { RiSparklingLine } from "react-icons/ri";

const AIButton = ({ bool, isClicked, onToggle }) => {
  return (
    <div
      className={`relative rounded-full p-[2px] transition-all duration-300 ease-in-out
        ${isClicked ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-transparent"}`}
    >
      <button
        disabled={bool}
        onClick={() => {
          if (!bool && onToggle) onToggle();
        }}
        className={`
          group relative flex items-center justify-center rounded-full p-2
          transition-all duration-300 ease-in-out 
          ${
            !bool ? "cursor-pointer" : "cursor-not-allowed"
          }
          ${isClicked ? "bg-white" : "bg-transparent"}
          hover:scale-110
        `}
      >
        <RiSparklingLine
          className={`
            relative z-10 transition-transform duration-500 ease-in-out
            ${!bool ? "group-hover:rotate-360" : "text-gray-500"}
          `}
        />
        {!isClicked && (
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ease-in-out
              ${bool ? "bg-gray-300" : ""}`}
          />
        )}
      </button>
    </div>
  );
};

export default AIButton;
