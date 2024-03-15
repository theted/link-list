import { LinkList } from "./components/LinksList/LinkList";
import { LinkForm } from "./components/LinkForm/LinkForm";
import { CategoriesList } from "./components/CategoriesList/CategoriesList";
import { HomeIcon } from "@radix-ui/react-icons";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import "./App.css";

const App = () => {
  const currentUrl = window.location.href.split("/");

  return (
    <div className="main">
      {currentUrl.length !== 4 && (
        <Link to="/">
          <HomeIcon />
        </Link>
      )}
      <p>WUT</p>
      <Outlet />
      {currentUrl.length === 4 && <CategoriesList />}
      <LinkList />
      <LinkForm />
    </div>
  );
};

export default App;
