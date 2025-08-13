import { createBrowserRouter } from "react-router-dom";
import Login from "./Pages/Login";
import Application from "./Pages/Application";

export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <AppWireframe />,
//     children: [
//       { index: true, element: <Home /> },
//       { path: "explore", element: <Explore /> },
//       { path: "library", element: <Library /> },
//       { path: "recommendations", element: <Recommendations /> },
//       { path: "media/:id", element: <Media /> },
//     ],
//   },
  { path: "/", element: <Application /> },
  { path: "/login", element: <Login /> }
]);