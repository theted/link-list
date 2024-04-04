import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./App.css";

const App = () => {
  const { authStatus } = useAuth();

  const userdata = {
    loggedIn: authStatus === 1,
  };

  return (
    <div className="p-10 mt-12">
      <Outlet />

      <div className="absolute top-0 right-0 p-4 border border-primary bg-secondary text-left">
        <pre>{JSON.stringify(userdata, null, 2)}</pre>
        <Link to="/login">{userdata.loggedIn ? "Profile" : "Login"}</Link>
      </div>
    </div>
  );
};

export default App;
