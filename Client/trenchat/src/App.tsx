import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useEffect, useState } from "react";


export default function App() {
  const [loading, setLoading] = useState(true);
  return <RouterProvider router={router} />;
}