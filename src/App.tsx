import { LinkForm } from "./components/LinkForm/LinkForm";
import { Outlet } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <div className="p-10 mt-12">
      <Outlet />

      <LinkForm />
    </div>
  );
};

export default App;
