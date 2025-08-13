import { useSelector } from "react-redux";
import type { RootState } from "../Redux/store";

export default function useUser() {
  return useSelector((state: RootState) => state.user.user);
}