import { configureStore } from "@reduxjs/toolkit";
import CesiumMapReducer from "./modules/CesiumMapReducer";

const AllStore = configureStore({
    reducer:{
        cesiumMap : CesiumMapReducer
    }
})

export type RootState = ReturnType<(typeof AllStore.getState)>
export type RootDispatch = typeof AllStore.dispatch

export default AllStore