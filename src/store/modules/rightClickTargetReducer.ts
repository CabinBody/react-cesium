import { createSlice } from "@reduxjs/toolkit";
import { ConfinedArea } from "../../global-env";

const initialState: ConfinedArea = {
    isConfigured: false,
    id: '',
    type: '',
    timeSpan: '',
    confineMethod: '',
    subscription: '',
}

const rightClickTargetReducer = createSlice({
    name: 'onRightClickTarget',
    initialState,
    reducers: {
        resetAllParams(state) {
            state.isConfigured = false
            state.id = ''
            state.timeSpan = ''
            state.confineMethod = ''
            state.subscription = ''
            state.type = ''
        },
        setIsConfigured(state, action) {
            state.isConfigured = action.payload
        },
        setId(state, action) {
            state.id = action.payload
        },
        setTimeSpan(state, action) {
            state.timeSpan = action.payload
        },
        setConfineMethod(state, action) {
            state.confineMethod = action.payload
        },
        setSubscription(state, action) {
            state.subscription = action.payload
        },
        setType(state, action){
            state.type = action.payload
        }
        
    }

})

const { setIsConfigured, setId, setTimeSpan, setConfineMethod, setSubscription ,resetAllParams,setType} = rightClickTargetReducer.actions


export { setConfineMethod, setTimeSpan, setId, setIsConfigured, setSubscription ,resetAllParams,setType}

export default rightClickTargetReducer.reducer