import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface UserState {
  user: UserData | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    updateUserPicture(state, action) {
      if (state.user) {
        state.user.picture = action.payload;
      }
    },
  },
});

export const { setUser, clearUser,updateUserPicture } = userSlice.actions;
export default userSlice.reducer;