import React, { useEffect, useState } from "react";
import Happy from "../assets/happy.png";
import Angry from "../assets/angry.png";
import { useDispatch, useSelector } from "react-redux";
import { toggleSaveForm } from "../redux/slices/formSlice";

function Hero() {
  const allEntries = useSelector((state) => state.entry.entries);
  const [logged, setLogged] = useState(false);
  const [msg1, setMsg1] = useState("You haven't logged today");
  const [msg2, setMsg2] = useState("If you don't I'm gonna hunt you down");
  const dispatch = useDispatch()

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const entryExists = allEntries.find((entry) => {
      const entryDate = new Date(entry.date ? entry.date : entry.createdAt)
        .toISOString()
        .split("T")[0];
      return entryDate === today;
    });

    if (entryExists) {
      setLogged(true);
    } else {
      setLogged(false);
    }
  }, [allEntries]);

  const handleCreateLog = () => {
    dispatch(toggleSaveForm())
  };
  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full">
      {logged ? (
        <div className="flex items-center text-center space-y-4 justify-around w-full">
          <p className="text-lg font-medium text-white">
            Good boii, you have already logged your entry today, Comeback
            tomorrow
          </p>
          <img
            src={Happy}
            alt="Happy emoji"
            className="w-32 h-32 lg:w-48 lg:h-48"
          />
        </div>
      ) : (
        <div className="flex items-center text-center space-y-4 justify-around w-full">
          <div className="flex flex-col">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-lg font-medium text-white">{msg1}</p>
              <p className="text-sm text-gray-400">{msg2}</p>
            </div>
            <button
              onClick={handleCreateLog}
              className="mt-4 px-6 py-3 rounded-full border hover:text-black border-white border-opacity-20 text-white font-semibold transition-all duration-200 hover:bg-white hover:bg-opacity-10 active:scale-95"
            >
              Create Log
            </button>
          </div>

          <img
            src={Angry}
            alt="Angry emoji"
            className="w-32 h-32 lg:w-48 lg:h-48"
          />
        </div>
      )}
    </div>
  );
}

export default Hero;
