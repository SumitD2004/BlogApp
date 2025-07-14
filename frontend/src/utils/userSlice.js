// import { createSlice } from "@reduxjs/toolkit";


//  const userSlice = createSlice({
//     name : "userSlice",
//     initialState : JSON.parse(localStorage.getItem("user")) || {token : null},
//     reducers : {
//         login(state , action){
//             state.name = action.payload.name;
//             state.email = action.payload.email;
//             state.token = action.payload.token;
//             state.username = action.payload.username;
//             state.profilePic = action.payload.profilePic;
//             state.bio = action.payload.bio;
//             localStorage.setItem("user" , JSON.stringify(action.payload));
//         },
//         logout(state , action){
//             localStorage.removeItem("user");
//             return {
//                 token : null,
//             }
//         }
//     }
//  })


// export const {login , logout} = userSlice.actions;
// export default userSlice.reducer;







import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userSlice",
  initialState: JSON.parse(localStorage.getItem("user")) || {
    token: null,
    name: null,
    username: null,
    email: null,
    id: null,
    profilePic: null,
    followers: [],
    following: [],
  },
  reducers: {
    login(state, action) {
      const newState = { followers: [], following: [], ...action.payload };
      localStorage.setItem("user", JSON.stringify(newState));
      return newState;
    },
    logout(state, action) {
      localStorage.removeItem("user");
      return {
        token: null,
      };
    },

    updateData(state, action) {
      const data = action.payload;
      if (data[0] === "visibility") {
        localStorage.setItem("user", JSON.stringify({ ...state, ...data[1] }));
        return { ...state, ...data };
      } else if (data[0] === "followers") {
        const finalData = {
          ...state,
          following: state?.following?.includes(data[1])
            ? state?.following?.filter((id) => id !== data[1])
            : [...state.following, data[1]],
        };

        localStorage.setItem("user", JSON.stringify(finalData));
        return finalData;
      }
    },
  },
});

export const { login, logout, updateData } = userSlice.actions;
export default userSlice.reducer;