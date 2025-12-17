import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type UserSlice } from "./interface/sliceInterface";

const initialState: UserSlice = {
  userId: null,
  email: null,
  role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        _id: string;
        email: string;
        role: string;
      }>
    ) => {
      const { _id, email, role } =
        action.payload;

      state.userId = _id;
      state.email = email;
      state.role = role;

      localStorage.setItem("user", JSON.stringify(state));
    },

    clearUserDetails: (state) => {
      state.userId = null;
      state.email = null;
      state.role = null;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
