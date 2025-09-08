import React from "react";
import HomeCal from "./HomeCal";
import { Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleEditForm } from "../redux/actions";

function DashCal() {
  const dispatch = useDispatch();
  const selDate = useSelector((state) => state.selectedDate);
  const allEntries = useSelector((state) => state.entries);

  // Check if an entry exists for the selected date
  const entryExists = selDate && allEntries.some(
    (entry) => new Date(entry.date ? entry.date : entry.createdAt).toISOString().split('T')[0] === selDate.toISOString().split('T')[0]
  );

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
