import { useState } from "react";
import one from "../assets/moods/1.webp";
import two from "../assets/moods/2.webp";
import three from "../assets/moods/3.webp";
import four from "../assets/moods/4.webp";
import five from "../assets/moods/5.webp";
import six from "../assets/moods/6.webp";
import seven from "../assets/moods/7.webp";
import eight from "../assets/moods/8.webp";
import nine from "../assets/moods/9.webp";
import ten from "../assets/moods/10.webp";

const moods = [
  { emoji: "😭", webp: one, description: "Extreme sadness / distress" },
  { emoji: "🥺", webp: two, description: "Sad / vulnerable" },
  { emoji: "😔", webp: three, description: "Low mood / tired" },
  { emoji: "🫤", webp: four, description: "Neutral / uneasy" },
  { emoji: "🙄", webp: five, description: "Frustrated / annoyed" },
  { emoji: "☹️", webp: six, description: "Mild sadness / disappointed" },
  { emoji: "😏", webp: seven, description: "Slightly pleased / smirk" },
  { emoji: "🤩", webp: eight, description: "Excited / thrilled" },
  { emoji: "🤗", webp: nine, description: "Happy / content / affectionate" },
  { emoji: "😇", webp: ten, description: "Calm joy / peaceful happiness" },
];

export default function MoodSelector({ selectedMood, setSelectedMood }) {
  const [hovered, setHovered] = useState(null);
  const [clicked, setClicked] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });

  const handleClick = (index) => {
    setSelectedMood(index + 1);
    setClicked(index);
    setTimeout(() => setClicked(null), 1000);
  };

  const handleMouseMove = (e, text) => {
    setTooltip({ visible: true, text, x: e.clientX - 430, y: e.clientY - 20 });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
    setHovered(null);
  };

  return (
    <div className="relative flex justify-between items-center space-x-2">
      {moods.map((mood, i) => {
        const isHovered = hovered === i;
        const isClicked = clicked === i;
        const isSelected = selectedMood === i + 1;
        const showAnimation = isHovered || isClicked || isSelected;

        return (
          <div
            key={i}
            className={`relative w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transform transition-all duration-200 
              ${showAnimation ? "scale-125" : "scale-100"}`}
            onMouseEnter={(e) => {
              setHovered(i);
              handleMouseMove(e, mood.description);
            }}
            onMouseMove={(e) => handleMouseMove(e, mood.description)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(i)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {showAnimation ? (
                <img
                  src={mood.webp}
                  alt={mood.emoji}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl">{mood.emoji}</span>
              )}
            </div>
          </div>
        );
      })}

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y-12,
            left: tooltip.x-12,
            pointerEvents: "none",
            zIndex: 50,
          }}
          className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap select-none"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
