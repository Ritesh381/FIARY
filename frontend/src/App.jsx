import { useEffect, useState } from "react";
import LightRays from "./ui/LightRays";
import JournalFormModal from "./components/JournalFormModal";
import {
  AiOutlineHome,
  AiOutlineDashboard,
  AiOutlineStar,
  AiOutlineSetting,
  AiOutlineUser,
} from "react-icons/ai";
import { FaRupeeSign } from "react-icons/fa";
import { Provider, useSelector } from "react-redux";
import store from "./redux/store.js";
import { useDispatch } from "react-redux";
import Dock from "./ui/Dock";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import Calendar from "./components/Finance.jsx";
import Moments from "./components/Moments";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import fetchEntries from "./api/fetchEntries.js";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import JournalEditFormModal from "./components/JournalEditFormModal.jsx";

// Create a wrapper component to use useNavigate
const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isModalOpen = useSelector((state) => state.isFormOpen);
  const isEditFormOpen = useSelector((state) => state.isEditFormOpen)

  // Update the onClick handlers to use navigate
  const items = [
    {
      icon: <AiOutlineHome size={20} />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      icon: <AiOutlineDashboard size={20} />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      icon: <FaRupeeSign size={20} />,
      label: "Finance",
      onClick: () => navigate("/finance"),
    },
    {
      icon: <AiOutlineStar size={20} />,
      label: "Moments",
      onClick: () => navigate("/moments"),
    },
    {
      icon: <AiOutlineSetting size={20} />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      icon: <AiOutlineUser size={20} />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
  ];

  useEffect(() => {
    dispatch(fetchEntries());
  }, [dispatch]);

  return (
    <>
      <div className="fixed inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <div className="bottom-0 right-[50%] fixed z-11">
        <Dock
          items={items}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
      <div className="fixed top-0 left-0 w-full z-11 p-4">
        <Nav />
      </div>

      <div className="relative w-full z-10 mt-15">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {isModalOpen && <JournalFormModal />}
      {isEditFormOpen && <JournalEditFormModal />}
    </>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-black p-8 font-sans text-gray-100 flex flex-col ">
      <BrowserRouter>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </BrowserRouter>
    </div>
  );
};

export default App;
