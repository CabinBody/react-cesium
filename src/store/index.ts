import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./modules/userReducer";
import pageSwitchReducer from "./modules/pageSwitchReducer";
import leftClickTargetReducer from './modules/leftClickTargetReducer'

const Store = configureStore({
    reducer: {
        pageSwitch: pageSwitchReducer,
        token: userReducer,
        onLeftClickTarget: leftClickTargetReducer
    }
})

export type RootState = ReturnType<(typeof Store.getState)>
export type RootDispatch = typeof Store.dispatch

export default Store