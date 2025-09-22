import { useEffect } from "react";
import LightRays from "./ui/LightRays";
import JournalFormModal from "./components/JournalFormModal";
import {
  AiOutlineHome,
  AiOutlineStar,
  AiOutlineSetting,
  AiOutlineUser,
} from "react-icons/ai";
import { BiCameraMovie } from "react-icons/bi";
import { FaRupeeSign } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dock from "./ui/Dock";
import Nav from "./components/Nav";
import Dashboard from "./pages/Dashboard.jsx";
import Moments from "./pages/Moments";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Movies from "./pages/Movies.jsx";
import fetchEntries from "./api/fetchEntries.js";
import JournalEditFormModal from "./components/JournalEditFormModal.jsx";
import LandingPage from "./pages/Landing.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import api from "./api/UserCalls.js";

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isModalOpen = useSelector((state) => state.forms.saveForm);
  const isEditFormOpen = useSelector((state) => state.forms.editForm);

  const items = [
    {
      icon: <AiOutlineHome size={20} />,
      label: "Home",
      onClick: () => navigate("/"),
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
      icon: <BiCameraMovie size={20} />,
      label: "Movies",
      onClick: () => navigate("/movies"),
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

  const showNavAndDock =
    localStorage.getItem("userId") &&
    location.pathname !== "/signup" &&
    location.pathname !== "/signin";

  const pageContainerClass = showNavAndDock ? "mt-15" : "";

  useEffect(() => {
    if (showNavAndDock) {
      dispatch(fetchEntries());
    }
  }, [dispatch, showNavAndDock]);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    api.getUserById(id, dispatch);
  });

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
          className="custom-rays bg-black"
        />
      </div>

      {showNavAndDock && (
        <>
          <div className="bottom-0 right-[50%] fixed z-11 max-w-[80%]">
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
        </>
      )}

      <div className={`relative w-full z-10 ${pageContainerClass}`}>
        <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem("userId") ? <Dashboard /> : <LandingPage />
            }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>

      {isModalOpen && <JournalFormModal />}
      {isEditFormOpen && <JournalEditFormModal />}
    </>
  );
};

export default AppContent;
