// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   Plus,
//   Camera,
//   X as XIcon,
//   Check,
//   DollarSign,
//   Clock,
//   Tag,
//   TrendingUp,
//   TrendingDown,
//   Calendar,
// } from "lucide-react";
// import MoodSelector from "../components/MoodSelector.jsx";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   setFormField,
//   updateHabitEntry,
//   resetForm,
//   loadEntryData,
// } from "../redux/slices/entryFormSlice.js";
// import { useNavigate, useLocation } from "react-router";
// import { fetchCategoriesAndSubcategories } from "../redux/slices/financeSlice";
// import apiHabits from "../api/HabitCalls.js";
// import apiTodo from "../api/TodoCalls.js";
// import EntryPageCalls from "../api/EntryPageCalls";
// import { addEntry } from "../redux/slices/entrySlice.js";

// // --- STATUS OVERLAY COMPONENT (omitted for brevity) ---
// const StatusOverlay = ({ state }) => {
//   if (state === "hidden") return null;

//   return (
//     <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm">
//       <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center w-64">
//         {state === "loading" && (
//           <>
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             <p className="text-white mt-4 text-lg">Saving Entry...</p>
//           </>
//         )}
//         {state === "success" && (
//           <>
//             <Check size={48} className="text-green-500" />
//             <p className="text-white mt-4 text-lg">Entry Saved!</p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// const GlassCard = ({ children, className = "" }) => (
//   <div
//     // Increased border opacity for better definition on small screens
//     className={`bg-gray-800/50 border border-gray-700/90 rounded-2xl shadow-lg ${className}`}
//   >
//     {children}
//   </div>
// );

// // Helper to get current time in HH:mm format
// const getCurrentTime = () => {
//   const now = new Date();
//   const hours = String(now.getHours()).padStart(2, "0");
//   const minutes = String(now.getMinutes()).padStart(2, "0");
//   return `${hours}:${minutes}`;
// };

// // --- FINANCE FORM HOOK (Simplified and inline for clarity) ---
// const useFinanceForm = (categories, selDate) => {
//   const [amount, setAmount] = useState("");
//   const [note, setNote] = useState("");
//   const [type, setType] = useState("Expense");
//   const [category_id, setCategoryId] = useState("");
//   const [sub_category_id, setSubCategoryId] = useState("");
//   const [transactionTime, setTransactionTime] = useState(getCurrentTime());
  
//   // New function to load data from an existing transaction
//   const loadData = (transaction) => {
//     setAmount(String(transaction.amount));
//     setNote(transaction.note || "");
//     setType(transaction.type);
//     setCategoryId(transaction.category_id);
//     setSubCategoryId(transaction.sub_category_id || "");
    
//     // Extract time from the 'when' ISO string (e.g., "2023-10-27T10:30:00.000Z" -> "10:30")
//     const time = transaction.when ? new Date(transaction.when).toISOString().substring(11, 16) : getCurrentTime();
//     setTransactionTime(time);
//   };

//   const reset = () => {
//     setAmount("");
//     setNote("");
//     setType("Expense"); // Reset type to default
//     setTransactionTime(getCurrentTime());
//     // Find default expense category dynamically
//     const defaultExpenseCat =
//       categories.find((c) => c.isExpense === true)?._id || "";
//     setCategoryId(defaultExpenseCat);
//     setSubCategoryId("");
//   };

//   const filteredCategories = useMemo(() => {
//     const isExpenseType = type === "Expense";
//     return categories.filter((cat) => cat.isExpense === isExpenseType);
//   }, [categories, type]);

//   const currentSubcategories = useMemo(() => {
//     const selectedCat = categories.find((c) => c._id === category_id);
//     return selectedCat?.subcategories || [];
//   }, [categories, category_id]);

//   useEffect(() => {
//     if (categories.length > 0) {
//       // Set default category only if category_id is invalid for the current type
//       const isCurrentCategoryValid = filteredCategories.some(c => c._id === category_id);
//       if (!isCurrentCategoryValid) {
//         const defaultCategory = filteredCategories[0]?._id || "";
//         setCategoryId(defaultCategory);
//         setSubCategoryId("");
//       }
//     }
//   }, [categories, category_id, type, filteredCategories]);

//   return {
//     amount,
//     setAmount,
//     note,
//     setNote,
//     type,
//     setType,
//     category_id,
//     setCategoryId,
//     sub_category_id,
//     setSubCategoryId,
//     transactionTime,
//     setTransactionTime,
//     reset,
//     loadData, // Expose loadData
//     filteredCategories,
//     currentSubcategories,
//     // Combine selected date (selDate) with chosen time (transactionTime)
//     data: {
//       amount: parseFloat(amount) || 0,
//       note,
//       type,
//       category_id,
//       sub_category_id: sub_category_id || null,
//       when: `${selDate}T${transactionTime}:00.000Z`,
//     },
//   };
// };

// // --- MAIN COMPONENT ---
// function EntryPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // --- NEW: Get date and edit from query params ---
//   const params = new URLSearchParams(location.search);
//   const queryDate = params.get("date");
//   const isEditMode = params.get("edit") === "1";

//   // --- Redux state ---
//   const selDate = queryDate || useSelector((state) => state.forms.date);
//   const { categories: financeCategories } = useSelector(
//     (state) => state.finance
//   );
//   const user = useSelector((state) => state.user.user);
//   const userId = user?._id;
//   const formData = useSelector((state) => state.entryData);
//   const { entry, todo, habits, finance, status, error } = formData;

//   const [userHabits, setUserHabits] = useState([]);
//   const [newTodoText, setNewTodoText] = useState("");
//   const [overlayState, setOverlayState] = useState("hidden");
//   const [todaysTodos, setTodaysTodos] = useState([]);
//   // New state to track which finance entry is being edited
//   const [editingFinanceId, setEditingFinanceId] = useState(null); 
  
//   const financeForm = useFinanceForm(financeCategories, selDate);

//   const getDayOfWeek = (date) => {
//     return date.toLocaleDateString('en-US', { weekday: 'long' });
//   };


//   // --- Initial Data Fetch ---
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ... (Other useEffects for Redux state, data loading, etc., remain the same)
//   useEffect(() => {
//     if (selDate && entry.date !== selDate) {
//       dispatch(
//         setFormField({ section: "entry", field: "date", value: selDate })
//       );
//     }
//   }, [selDate, dispatch, entry.date]);

//   useEffect(() => {
//     dispatch(fetchCategoriesAndSubcategories());
//     // Fetch habits and todos for UI display
//     const fetchData = async () => {
//       try {
//         const habits = await apiHabits.getAllHabits();
//         setUserHabits(habits.filter((h) => !h.isDeleted));
//         const todos = await apiTodo.getTodosByDate(selDate);
//         setTodaysTodos(todos || []);
//       } catch (error) {
//         console.error("Failed to fetch habits/todos:", error);
//       }
//     };
//     fetchData();
//   }, [selDate, dispatch]);

//   // --- NEW: Load entry data if editing ---
//   useEffect(() => {
//     const fetchEntryData = async () => {
//       if (isEditMode && selDate) {
//         try {
//           setOverlayState("loading");
//           const data = await EntryPageCalls.getAll(selDate);
//           dispatch(loadEntryData(data));
//           setOverlayState("hidden");
//         } catch (error) {
//           setOverlayState("hidden");
//           console.error("Failed to fetch entry data:", error);
//         }
//       }
//     };
//     fetchEntryData();
//   }, [isEditMode, selDate, dispatch]);

//   // --- Overlay logic for save/update feedback ---
//   useEffect(() => {
//     if (overlayState === "success") {
//       const timer = setTimeout(() => {
//         navigate("/");
//         // NEW: Also reset the form state after successful save/update and navigation
//         dispatch(resetForm()); 
//       }, 500);
//       return () => clearTimeout(timer);
//     }
//   }, [overlayState, navigate, dispatch]);
//   // --- END OF USE EFFECTS ---

//   // --- Handlers ---
//   const handleEntryChange = (field, value) => {
//     dispatch(setFormField({ section: "entry", field, value }));
//   };

//   const handleAddTodoAddition = (e) => {
//     e.preventDefault();
//     if (newTodoText.trim() === "") return;
//     const newAddition = {
//       id: Date.now(),
//       title: newTodoText,
//       frequency: "daily",
//       userId: userId,
//     };
//     const newAdditions = [...todo.addition, newAddition];
//     dispatch(
//       setFormField({ section: "todo", field: "addition", value: newAdditions })
//     );
//     setNewTodoText("");
//   };

//   const handleCompleteTodo = (task) => {
//     const isCompleted = todo.completed.some((t) => t._id === task._id);
//     let updatedCompleted;
//     if (isCompleted) {
//       updatedCompleted = todo.completed.filter((t) => t._id !== task._id);
//     } else {
//       updatedCompleted = [...todo.completed, task];
//     }
//     dispatch(
//       setFormField({
//         section: "todo",
//         field: "completed",
//         value: updatedCompleted,
//       })
//     );
//   };

//   const handleHabitToggle = (habit, currentEntry) => {
//     const isDone = currentEntry?.done || false;
//     dispatch(
//       updateHabitEntry({
//         habitId: habit._id,
//         entry: { done: !isDone, date: entry.date },
//       })
//     );
//   };

//   const handleHabitNotesChange = (habit, newNotes) => {
//     dispatch(
//       updateHabitEntry({
//         habitId: habit._id,
//         entry: { notes: newNotes, date: entry.date },
//       })
//     );
//   };

//   const getFinanceEntryDetails = (financeEntryData) => {
//       const selectedCategory = financeCategories.find(
//         (c) => c._id === financeEntryData.category_id
//       );
//       // Find subcategory from the full list (or just the current one if not already in the entry)
//       const subcategories = selectedCategory?.subcategories || [];
//       const selectedSubcategory = subcategories.find(
//         (s) => s._id === financeEntryData.sub_category_id
//       );
      
//       return {
//           ...financeEntryData,
//           category_name: selectedCategory?.name,
//           sub_category_name: selectedSubcategory?.name,
//       };
//   }

//   const handleAddFinance = (e) => {
//     e.preventDefault();
//     if (
//       !financeForm.amount ||
//       !financeForm.category_id ||
//       parseFloat(financeForm.amount) <= 0
//     )
//       return;
      
//     const newEntryDetails = getFinanceEntryDetails(financeForm.data);
    
//     // Assign a temporary ID if one doesn't exist (for new entries)
//     const id = Date.now(); 
    
//     const newFinanceList = [...finance, { ...newEntryDetails, id }];
    
//     dispatch(
//       setFormField({
//         section: "finance",
//         field: "finance",
//         value: newFinanceList,
//       })
//     );
//     financeForm.reset();
//   };

//   const handleUpdateFinance = (e) => {
//     e.preventDefault();
//     if (
//       !editingFinanceId ||
//       !financeForm.amount ||
//       !financeForm.category_id ||
//       parseFloat(financeForm.amount) <= 0
//     )
//       return;

//     const updatedEntryDetails = getFinanceEntryDetails(financeForm.data);
    
//     const updatedFinanceList = finance.map(item => 
//       item.id === editingFinanceId ? { ...updatedEntryDetails, id: editingFinanceId } : item
//     );

//     dispatch(
//       setFormField({
//         section: "finance",
//         field: "finance",
//         value: updatedFinanceList,
//       })
//     );
    
//     // Reset form and editing state
//     financeForm.reset();
//     setEditingFinanceId(null);
//   }

//   const handleSelectFinanceForEdit = useCallback((transaction) => {
//     // Set the ID of the transaction being edited
//     setEditingFinanceId(transaction.id);
    
//     // Load the transaction data into the form hook
//     financeForm.loadData(transaction);
//   }, [financeForm]);

//   const handleDeleteFinance = (idToDelete) => {
//     const updatedFinanceList = finance.filter(item => item.id !== idToDelete);
    
//     dispatch(
//       setFormField({
//         section: "finance",
//         field: "finance",
//         value: updatedFinanceList,
//       })
//     );

//     // If we delete the one currently being edited, reset the form
//     if (editingFinanceId === idToDelete) {
//         financeForm.reset();
//         setEditingFinanceId(null);
//     }
//   }

//   // Determine the correct submit handler
//   const financeSubmitHandler = editingFinanceId ? handleUpdateFinance : handleAddFinance;
//   const financeButtonText = editingFinanceId ? "Update Transaction" : "Add Transaction to Log";


//   // --- Save/Update logic (remains the same) ---
//   const handleSave = async () => {
//     setOverlayState("loading");
//     try {
//       const resp = await EntryPageCalls.saveAll({
//         entry,
//         habits,
//         todos: todo,
//         finance,
//       });

//       if (resp.success) {
//         try {
//           // Pass the actual entry object to addEntry
//           dispatch(addEntry({ entry }));
//         } catch (err) {
//           console.warn("Failed to dispatch addEntry:", err);
//         }

//         // Do not reset form here, it's done in the useEffect after navigation
//         setOverlayState("success");
//         return;
//       }

//       // Fallback to previous success flag if present
//       if (resp && resp.success) {
//         // Do not reset form here
//         setOverlayState("success");
//         return;
//       }

//       setOverlayState("hidden");
//       // Optionally show error message here
//     } catch (error) {
//       setOverlayState("hidden");
//       console.error("Failed to save entry:", error);
//     }
//   };

//   const handleUpdate = async () => {
//     setOverlayState("loading");
//     try {
//       const resp = await EntryPageCalls.updateAll({
//         entry,
//         habits,
//         todos: todo,
//         finance,
//       });

//       const updated =
//         resp?.entry ||
//         resp?.data?.entry ||
//         resp?.updatedEntry ||
//         resp?.data?.updatedEntry ||
//         (resp?.success && resp?.data) ||
//         null;

//       if (updated) {
//         // For update we also push to entries slice (keeps list updated)
//         try {
//           dispatch(addEntry({ entry: updated }));
//         } catch (err) {
//           console.warn("Failed to dispatch addEntry for update:", err);
//         }

//         setOverlayState("success");
//         return;
//       }

//       if (resp && resp.success) {
//         setOverlayState("success");
//         return;
//       }

//       setOverlayState("hidden");
//     } catch (error) {
//       setOverlayState("hidden");
//       console.error("Failed to update entry:", error);
//     }
//   };


//   return (
//     // Adjusted padding for smaller screens (p-4)
//     <div className="bg-transparent min-h-screen text-gray-300 p-4 md:p-8 font-sans mb-20">
//       <StatusOverlay state={overlayState} />
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* --- HEADER & MOOD --- */}
//         <div className="p-0 rounded-2xl">
//           <div className="flex justify-between items-center mb-2">
//             <h1 className="text-xl md:text-2xl font-bold text-white">
//               {new Date(selDate + "T00:00:00").toLocaleDateString("en-US", {
//                 dateStyle: "long",
//               })}
//             </h1>
//             <div className="order-1 sm:order-none w-full sm:w-[88px] flex justify-center items-center py-1">
//             <span className="text-lg sm:text-base font-bold text-white tracking-wide">
//                 {getDayOfWeek(new Date(selDate + "T00:00:00"))}
//             </span>
//         </div>
//           </div>
//           <MoodSelector
//             selectedMood={entry.feelingScore}
//             setSelectedMood={(value) =>
//               handleEntryChange("feelingScore", value)
//             }
//           />
//         </div>

//         {/* --- JOURNAL & NOTES --- */}
//         <GlassCard className="p-4 space-y-4">
//           {/* Changed to flex-col (default) then md:flex-row */}
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-grow">
//               <textarea
//                 rows="3"
//                 placeholder="Achievement of the day"
//                 className="w-full bg-gray-900/70 resize-none rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
//                 value={entry.achievement}
//                 onChange={(e) =>
//                   handleEntryChange("achievement", e.target.value)
//                 }
//               />
//             </div>
//             {/* Flex-shrink-0 ensures it doesn't take up too much width on desktop */}
//             <div className="space-y-3 flex-shrink-0">
//               <div className="flex items-center gap-3">
//                 <input
//                   type="number"
//                   placeholder="0"
//                   className="w-12 md:w-16 bg-gray-900/70 text-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm"
//                   value={entry.sleepHours}
//                   onChange={(e) =>
//                     handleEntryChange("sleepHours", e.target.value)
//                   }
//                 />
//                 <span className="text-xs text-gray-400">Hrs</span>
//                 <input
//                   type="text"
//                   placeholder="Sleep Notes"
//                   className="flex-grow bg-transparent focus:outline-none border-b border-gray-700 focus:border-teal-400 text-sm"
//                   value={entry.sleepNotes}
//                   onChange={(e) =>
//                     handleEntryChange("sleepNotes", e.target.value)
//                   }
//                 />
//               </div>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="number"
//                   placeholder="0"
//                   className="w-12 md:w-16 bg-gray-900/70 text-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm"
//                   value={entry.timeWastedMinutes}
//                   onChange={(e) =>
//                     handleEntryChange("timeWastedMinutes", e.target.value)
//                   }
//                 />
//                 <span className="text-xs text-gray-400">Min</span>
//                 <input
//                   type="text"
//                   placeholder="Unutilized time Notes"
//                   className="flex-grow bg-transparent focus:outline-none border-b border-gray-700 focus:border-teal-400 text-sm"
//                   value={entry.timeWastedNotes}
//                   onChange={(e) =>
//                     handleEntryChange("timeWastedNotes", e.target.value)
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//           <textarea
//             rows="10" // Slightly reduced rows for mobile screen space
//             placeholder="Start writing your beautiful day's story...."
//             className="w-full bg-gray-900/70 rounded-lg resize-none px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
//             value={entry.diaryEntry}
//             onChange={(e) => handleEntryChange("diaryEntry", e.target.value)}
//           />
//         </GlassCard>

//         {/* --- TODO SECTION --- */}
//         {/* Reduced padding to p-4 on mobile */}
//         <GlassCard className="p-4 md:p-6">
//           <h2 className="text-lg md:text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
//             <Check size={20} /> Today's Todos
//           </h2>
//           <div className="space-y-2 md:space-y-3">
//             {todaysTodos.length === 0 ? (
//               <p className="text-gray-500 italic text-sm">
//                 No tasks set for today. Stay productive!
//               </p>
//             ) : (
//               todaysTodos.map((task) => {
//                 const isCompleted = todo.completed.some(
//                   (t) => t._id === task._id
//                 );
//                 return (
//                   <div
//                     key={task._id}
//                     className={`flex items-center gap-3 p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${
//                       isCompleted
//                         ? "bg-green-900/30 line-through text-gray-500"
//                         : "bg-gray-700/50 hover:bg-gray-700"
//                     }`}
//                     onClick={() => handleCompleteTodo(task)}
//                   >
//                     <div
//                       className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
//                         isCompleted
//                           ? "border-green-500 bg-green-500"
//                           : "border-gray-500"
//                       }`}
//                     >
//                       {isCompleted && (
//                         <Check size={12} className="text-white" />
//                       )}
//                     </div>
//                     <span className="flex-1 truncate">{task.title}</span>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </GlassCard>

//         {/* --- CREATE TODOS FOR TOMORROW --- */}
//         <GlassCard className="p-4 md:p-6">
//           <h2 className="text-lg md:text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
//             <Plus size={20} /> Tasks for Tomorrow
//           </h2>
//           <div className="space-y-3">
//             <form onSubmit={handleAddTodoAddition} className="relative">
//               <input
//                 type="text"
//                 placeholder="Add a new task for tomorrow"
//                 className="w-full bg-gray-900/70 rounded-lg pl-4 pr-10 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
//                 value={newTodoText}
//                 onChange={(e) => setNewTodoText(e.target.value)}
//               />
//               <button
//                 type="submit"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-white"
//               >
//                 <Plus size={20} />
//               </button>
//             </form>
//             {/* Display todos added to Redux state */}
//             {todo.addition.map((item, index) => (
//               <div
//                 key={item.id}
//                 className="bg-gray-700/50 p-3 rounded-lg text-gray-300 flex justify-between items-center text-sm"
//               >
//                 <span className="truncate">{item.title}</span>
//               </div>
//             ))}
//           </div>
//         </GlassCard>

//         {/* --- HABITS SECTION --- */}
//         <GlassCard className="p-4 md:p-6">
//           <h2 className="text-lg md:text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
//             Habits
//           </h2>
//           <div className="space-y-2 md:space-y-3">
//             {userHabits.length === 0 ? (
//               <p className="text-gray-500 italic text-sm">
//                 No active habits defined.
//               </p>
//             ) : (
//               userHabits.map((habit) => {
//                 const habitEntry = habits.find((h) => h.habitId === habit._id);
//                 const isDone = habitEntry?.done === true;

//                 let buttonClass = "bg-gray-700/50 border border-gray-600";
//                 let icon = null;

//                 if (isDone) {
//                   buttonClass = "bg-green-600 border-green-500";
//                   icon = <Check size={16} className="text-white" />;
//                 }

//                 return (
//                   <div
//                     key={habit._id}
//                     // Changed layout for better fit on small screens
//                     className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 p-2 border-b border-gray-700/50 last:border-b-0"
//                   >
//                     {/* Left Side: Title - Full width on mobile, 1/3 on desktop */}
//                     <span className="font-medium w-full md:w-1/3 truncate text-white text-base md:text-lg">
//                       {habit.icon} {habit.title}
//                     </span>

//                     {/* Right Side: Controls (Checkbox + Input) - Full width on mobile, 2/3 on desktop */}
//                     <div className="flex items-center gap-2 w-full md:w-2/3">
//                       <button
//                         onClick={() => handleHabitToggle(habit, habitEntry)}
//                         className={`p-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${buttonClass}`}
//                         aria-label={`Toggle habit: ${habit.title}`}
//                       >
//                         {icon}
//                       </button>

//                       <input
//                         type="text"
//                         placeholder="Notes..."
//                         className="w-full bg-gray-700/50 rounded-md px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-400 border border-gray-700/50"
//                         value={habitEntry?.notes || ""}
//                         onChange={(e) =>
//                           handleHabitNotesChange(habit, e.target.value)
//                         }
//                         disabled={!isDone}
//                       />
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </GlassCard>

//         {/* --- FINANCE SECTION --- */}
//         <GlassCard className="p-4 md:p-6">
//           <h2 className="text-lg md:text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
//             <DollarSign size={20} /> Transactions for Today
//           </h2>
//           <form onSubmit={financeSubmitHandler} className="space-y-4">
//             {/* Type Selector (Simplified) */}
//             <div className="flex gap-3 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
//               <button
//                 type="button"
//                 onClick={() => financeForm.setType("Income")}
//                 className={`flex-1 py-1 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 ${
//                   financeForm.type === "Income"
//                     ? "bg-green-600 text-white"
//                     : "text-gray-300 hover:bg-gray-700/50"
//                 }`}
//               >
//                 <TrendingUp size={16} /> Income
//               </button>
//               <button
//                 type="button"
//                 onClick={() => financeForm.setType("Expense")}
//                 className={`flex-1 py-1 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 ${
//                   financeForm.type === "Expense"
//                     ? "bg-red-600 text-white"
//                     : "text-gray-300 hover:bg-gray-700/50"
//                 }`}
//               >
//                 <TrendingDown size={16} /> Expense
//               </button>
//             </div>
            
//             {/* Time Input Field */}
//             <div className="flex items-center gap-3">
//               <Calendar size={18} className="text-gray-400 flex-shrink-0" />
//               <span className="text-xs md:text-sm text-gray-300 flex-shrink-0">
//                 {new Date(selDate + "T00:00:00").toLocaleDateString("en-US", {
//                   month: "short",
//                   day: "numeric",
//                 })}
//               </span>
//               <Clock
//                 size={18}
//                 className="text-gray-400 ml-2 md:ml-4 flex-shrink-0"
//               />
//               <input
//                 type="time"
//                 value={financeForm.transactionTime}
//                 onChange={(e) => financeForm.setTransactionTime(e.target.value)}
//                 className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
//               />
//             </div>

//             {/* Grid for selectors - maintains 2 columns which is generally fine */}
//             <div className="grid grid-cols-2 gap-3">
//               {/* Category Selector */}
//               <div>
//                 <select
//                   name="category_id"
//                   value={financeForm.category_id}
//                   onChange={(e) => financeForm.setCategoryId(e.target.value)}
//                   className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
//                   required
//                 >
//                   {financeForm.filteredCategories.length === 0 ? (
//                     <option value="">No categories</option>
//                   ) : (
//                     financeForm.filteredCategories.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               {/* Subcategory Selector */}
//               <div>
//                 <select
//                   name="sub_category_id"
//                   value={financeForm.sub_category_id}
//                   onChange={(e) => financeForm.setSubCategoryId(e.target.value)}
//                   className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
//                   disabled={financeForm.currentSubcategories.length === 0}
//                 >
//                   <option value="">-- Subcategory --</option>
//                   {financeForm.currentSubcategories.map((sub) => (
//                     <option key={sub._id} value={sub._id}>
//                       {sub.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="relative">
//               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
//                 ₹
//               </span>
//               <input
//                 type="number"
//                 placeholder="Amount (required)"
//                 className="w-full bg-gray-900/70 rounded-lg pl-8 pr-4 py-3 border border-gray-700/50 text-sm md:text-base"
//                 value={financeForm.amount}
//                 onChange={(e) => financeForm.setAmount(e.target.value)}
//                 required
//               />
//             </div>
//             <input
//               type="text"
//               placeholder="Note (optional)"
//               className="w-full bg-gray-900/70 rounded-lg px-4 py-3 border border-gray-700/50 text-sm md:text-base"
//               value={financeForm.note}
//               onChange={(e) => financeForm.setNote(e.target.value)}
//             />

//             <button
//               type="submit"
//               // Dynamically change button color based on action
//               className={`${editingFinanceId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-red-600 hover:bg-red-500'} text-white px-4 py-2 rounded-lg text-sm font-semibold w-full`}
//             >
//               {financeButtonText}
//             </button>

//             {editingFinanceId && (
//                 <button
//                     type="button"
//                     onClick={() => {
//                         financeForm.reset();
//                         setEditingFinanceId(null);
//                     }}
//                     className="text-gray-400 hover:text-white mt-2 text-xs w-full text-center"
//                 >
//                     Cancel Update
//                 </button>
//             )}

//             {/* Display temporary transactions added */}
//             <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/50">
//               {finance.length === 0 ? (
//                 <p className="text-gray-500 italic text-xs">
//                   No transactions added for today.
//                 </p>
//               ) : (
//                 finance.map((item) => {
//                   // Ensure ID is present for both new and potentially loaded entries
//                   const itemId = item.id || item._id; 
//                   const isEditing = itemId === editingFinanceId;
                  
//                   return (
//                     <div
//                       key={itemId}
//                       // Use a div with role="button" for accessibility
//                       role="button" 
//                       onClick={() => handleSelectFinanceForEdit(item)}
//                       className={`p-1.5 rounded-lg flex gap-2 items-center relative text-xs cursor-pointer transition-all duration-200 ${
//                         item.type === "Income"
//                           ? "bg-green-900/50 text-green-300 hover:bg-green-800/50"
//                           : "bg-red-900/50 text-red-300 hover:bg-red-800/50"
//                       } ${isEditing ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-orange-500 scale-105' : ''}`}
//                     >
//                       <span className="font-semibold">
//                         {item.category_name || item.type}
//                       </span>
//                       {/* Optional: Display note if available when editing or if box is bigger */}
//                       {isEditing && item.note && (
//                           <span className="text-xs italic opacity-75 hidden sm:inline">
//                               ({item.note})
//                           </span>
//                       )}
//                       <span className="text-xs font-mono">
//                         ₹{parseFloat(item.amount).toFixed(2)}
//                       </span>
                      
//                       {/* Delete Button */}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation(); // Prevent the parent click handler from firing
//                           handleDeleteFinance(itemId);
//                         }}
//                         className="p-0.5 ml-1 rounded-full text-gray-400 hover:text-white hover:bg-black/20 transition-colors"
//                         aria-label="Delete transaction"
//                       >
//                         <XIcon size={12} />
//                       </button>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </form>
//         </GlassCard>

//         {/* --- SAVE BUTTON --- */}
//         <div className="flex flex-col items-center justify-center pt-4">
//           {isEditMode ? (
//             <button
//               onClick={handleUpdate}
//               disabled={
//                 overlayState === "loading" || overlayState === "success"
//               }
//               className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed w-full max-w-xs text-base"
//             >
//               Update Entry
//             </button>
//           ) : (
//             <button
//               onClick={handleSave}
//               disabled={
//                 overlayState === "loading" || overlayState === "success"
//               }
//               className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed w-full max-w-xs text-base"
//             >
//               Save Complete Daily Log
//             </button>
//           )}

//           {status === "failed" && (
//             <p className="text-red-400 mt-4 text-sm">{error}</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EntryPage;

import EntryPage from '../components/EntryPage/Entry'

function Entry() {
  return (
    <EntryPage/>
  )
}

export default Entry