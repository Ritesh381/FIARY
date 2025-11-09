import { useEffect } from "react";
import LightRays from "./ui/LightRays";
import {
  AiOutlineHome,
  AiOutlineStar,
  AiOutlineSetting,
  AiOutlineUser,
} from "react-icons/ai";
import { RiBookShelfFill } from "react-icons/ri";
import { TfiThought } from "react-icons/tfi";
import { FaRupeeSign, FaTasks, FaRegSmileBeam } from "react-icons/fa";
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
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import fetchEntries from "./api/fetchEntries.js";
import LandingPage from "./pages/Landing.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import userApi from "./api/userCalls.js";
import TheShelf from "./pages/TheShelf.jsx";
import Memories from "./pages/Memories.jsx";
import Tasks from "./pages/Tasks.jsx";
import Thoughts from "./pages/Thoughts.jsx";
import Entry from "./pages/Entry.jsx";
import Habits from "./pages/Habits.jsx";

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      icon: <AiOutlineHome size={18} />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      icon: <FaTasks size={18} />,
      label: "Tasks",
      onClick: () => navigate("/tasks"),
    },
    {
      icon: <FaRegSmileBeam size={18} />,
      label: "Habits & Hobies",
      onClick: () => navigate("/habits"),
    },
    {
      icon: <FaRupeeSign size={18} />,
      label: "Finance",
      onClick: () => navigate("/finance"),
    },
    {
      icon: <AiOutlineStar size={18} />,
      label: "Memories",
      onClick: () => navigate("/memories"),
    },
    {
      icon: <TfiThought size={18} />,
      label: "Thoughts",
      onClick: () => navigate("/thoughts"),
    },
    {
      icon: <RiBookShelfFill size={18} />,
      label: "The Shelf",
      onClick: () => navigate("/shelf"),
    },
    // {
    //   icon: <AiOutlineSetting size={20} />,
    //   label: "Settings",
    //   onClick: () => navigate("/settings"),
    // },
    // {
    //   icon: <AiOutlineUser size={20} />,
    //   label: "Profile",
    //   onClick: () => navigate("/profile"),
    // },
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
    userApi.getUser(dispatch);
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
              panelHeight={58}
              baseItemSize={40}
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
          <Route path="/memories" element={<Memories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shelf" element={<TheShelf />} />
          <Route path="/tasks" element={<Tasks />}></Route>
          <Route path="/thoughts" element={<Thoughts />}></Route>
          <Route path="/habits" element={<Habits />}></Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
          <Route path="/entry" element={<Entry/>}></Route>
        </Routes>
      </div>
    </>
  );
};

export default AppContent;
