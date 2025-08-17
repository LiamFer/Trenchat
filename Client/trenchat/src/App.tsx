import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authMe } from "./Service/server.service";
import { setUser } from "./Redux/userSlice";
import Loading from "./Components/Loading/Loading";


export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchToken = async () => {
      const response = await authMe();
      if (response?.success) {
        dispatch(setUser(response.data));
      }
      setLoading(false);
    };
    fetchToken();
  }, []);

  if (loading) return <Loading />;
  return <RouterProvider router={router} />;
}