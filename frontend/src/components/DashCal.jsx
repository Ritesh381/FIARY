import React from "react";
import HomeCal from "./HomeCal";
import { Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleEditForm } from "../redux/slices/formSlice";

function DashCal() {
  const dispatch = useDispatch();
  const selDate = useSelector((state) => state.forms.date); 
  const allEntries = useSelector((state) => state.entry.entries);

  const entryExists =
    selDate &&
    allEntries.some((entry) => {
      const entryDate = new Date(entry.date ? entry.date : entry.createdAt);
      const entryDateString = `${entryDate.getFullYear()}-${(
        entryDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${entryDate.getDate().toString().padStart(2, "0")}`;
      return entryDateString === selDate;
    });

  return (
    <div className="relative">
      <HomeCal />
      {entryExists && (
        <button
          className="absolute top-11 left-12 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors duration-300"
          onClick={() => {
            dispatch(toggleEditForm());
          }}
        >
          <Pencil size={24} />
        </button>
      )}
    </div>
  );
}

export default DashCal;