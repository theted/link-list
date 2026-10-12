import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage, NotFound } from "@/routes/ErrorPage";
import { LinksView } from "./LinksView";
import App from "../App";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: LinksView },
      { path: "categories/:id", Component: LinksView },
      // The splash page is the sign-in page now
      { path: "login", element: <Navigate to="/" replace /> },
    ],
  },
  { path: "*", Component: NotFound },
]);

export const AppWithRouter = () => <RouterProvider router={router} />;
