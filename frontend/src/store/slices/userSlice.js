import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../../utils";

// signin user
const signInUser = createAsyncThunk(
  "user/signin",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/auth/signin",
        data
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// signup user
const signUpUser = createAsyncThunk(
  "user/signup",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/auth/signup",
        data
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 413)
        return rejectWithValue("Image Size is too large!");
      else return rejectWithValue(err.response.data.message);
    }
  }
);

// initial value
const initialState = {
  room: "",
  name: "",
  email: "",
  file: "",
  token: "",
  isLoading: true,
  error: "",
};

// slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      setLocalStorage("user", action.payload);
      return action.payload;
    },

    logoutUser(state, action) {
      removeLocalStorage("user");
      return { ...initialState, isLoading: false };
    },

    loadUser(state, action) {
      const user = getLocalStorage("user");
      if (user) {
        return {
          ...user,
          isLoading: false,
        };
      }
      state.isLoading = false;
      return state;
    },

    removeError(state, action) {
      return {
        ...state,
        error: "",
      };
    },
  },

  extraReducers: (builder) => {
    // signin
    builder.addCase(signInUser.fulfilled, (state, action) => {
      const user = action.payload;
      state = {
        ...state,
        name: user.fName + " " + user.lName,
        email: user.email,
        file: user.file,
        token: user.token,
        isLoading: false,
        error: "",
      };

      setLocalStorage("user", state);
      return state;
    });
    builder.addCase(signInUser.pending, (state) => {
      state = {
        ...state,
        name: "",
        email: "",
        file: "",
        token: "",
        isLoading: true,
        error: "",
      };

      setLocalStorage("user", state);
      return state;
    });
    builder.addCase(signInUser.rejected, (state, action) => {
      state = {
        ...state,
        name: "",
        email: "",
        file: "",
        token: "",
        isLoading: false,
        error: action.payload,
      };
      return state;
    });

    // signup
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      const user = action.payload;
      state = {
        ...state,
        name: user.fName + " " + user.lName,
        email: user.email,
        file: user.file,
        token: user.token,
        isLoading: false,
        error: "",
      };

      setLocalStorage("user", state);
      return state;
    });
    builder.addCase(signUpUser.pending, (state) => {
      state = {
        ...state,
        name: "",
        email: "",
        file: "",
        token: "",
        isLoading: true,
        error: "",
      };

      setLocalStorage("user", state);
      return state;
    });
    builder.addCase(signUpUser.rejected, (state, action) => {
      state = {
        ...state,
        name: "",
        email: "",
        file: "",
        token: "",
        isLoading: false,
        error: action.payload,
      };
      return state;
    });
  },
});

export const { setUser, loadUser, logoutUser, removeError } = userSlice.actions;
export { signInUser, signUpUser };
export default userSlice.reducer;
