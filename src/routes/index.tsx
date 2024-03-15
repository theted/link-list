import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Home } from "./Home";
import { Category } from "./Category";
import { ErrorPage } from "@/routes/ErrorPage";
import App from "../App";

export const AppWithRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: App,
      children: [
        {
          index: true,
          Component: Home,
        },

        {
          path: "categories/:id",
          Component: Category,
        },
        {
          path: "*",
          Component: ErrorPage,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};
