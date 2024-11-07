import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./modules/userReducer";
import pageSwitchReducer from "./modules/pageSwitchReducer";
import leftClickTargetReducer from './modules/leftClickTargetReducer'
import rightClickTargetReducer from './modules/rightClickTargetReducer'
import alertQueueReducer from './modules/alertQueueReducer'

const Store = configureStore({
    reducer: {
        pageSwitch: pageSwitchReducer,
        token: userReducer,
        onLeftClickTarget: leftClickTargetReducer,
        onRightClickTarget: rightClickTargetReducer,
        alertQueueStore: alertQueueReducer
    }
})

export type RootState = ReturnType<(typeof Store.getState)>
export type RootDispatch = typeof Store.dispatch

export default Store