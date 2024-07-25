import { configureStore } from "@reduxjs/toolkit";
import CesiumMapReducer from "./modules/CesiumMapReducer";
import userReducer from "./modules/userReducer";

const Store = configureStore({
    reducer: {
        cesiumMap: CesiumMapReducer,
        token: userReducer
    }
})

export type RootState = ReturnType<(typeof Store.getState)>
export type RootDispatch = typeof Store.dispatch

export default Store