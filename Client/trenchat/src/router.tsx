import { createBrowserRouter } from "react-router-dom";
import Login from "./Pages/Login";
import Application from "./Pages/Application";
import AppWireframe from "./Pages/AppWireframe";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWireframe />,
    children: [
      { index: true, element: <Application /> },
      // { path: "explore", element: <Explore /> },
    ],
  },
  { path: "/login", element: <Login /> }
]);