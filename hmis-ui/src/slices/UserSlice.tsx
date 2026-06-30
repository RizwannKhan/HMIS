import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const userSlice = createSlice({
  name: "user",
  initialState: localStorage.getItem("token")
    ? jwtDecode(localStorage.getItem("token") || "")
    : ({} as Record<string, unknown>), // ✅ add type so TS doesn't complain
  reducers: {
    setUser: (state, action) => {
      return action.payload; // ✅ simpler — just return payload directly
    },
    removeUser: () => {
      return {}; // ✅ simpler — just return empty object
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
