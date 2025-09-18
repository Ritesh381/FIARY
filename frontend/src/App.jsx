import { BrowserRouter } from "react-router-dom";
import AppContent from "./AppContent";

const App = () => {
  return (
    <div className="min-h-screen p-8 font-urbane text-gray-100 flex flex-col ">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
};

export default App;