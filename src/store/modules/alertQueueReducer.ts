import { createSlice } from "@reduxjs/toolkit";
export interface AlertQueueState {
    id: string
    title: string
    content: string
    isFinished: boolean
}

const initialState = {
    alertQueue: [] as AlertQueueState[],
    finishedAlerts: [] as AlertQueueState[]

}

const alertQueueReducer = createSlice({
    name: 'alertQueueStore',
    initialState,
    reducers: {
        setAlertQueue(state, action) {
            let check = state.alertQueue.find(item => item.id === action.payload.id)
            if (check) {
                return
            }
            state.alertQueue.push(action.payload)
        },
        removeAlertQueue(state, action) {
            state.alertQueue = state.alertQueue.filter(item => item.id!== action.payload)
        },
        setFinishedAlerts(state, action) {
            let check = state.finishedAlerts.find(item => item.id === action.payload.id)
            if (check) {
                return
            }
            state.finishedAlerts.push(action.payload)
        },
        removeFinishedAlerts(state,action) {
            state.finishedAlerts = state.finishedAlerts.filter(item => item.id !== action.payload)
        }
    }

})

const { setAlertQueue, removeAlertQueue, setFinishedAlerts, removeFinishedAlerts } = alertQueueReducer.actions

export { setAlertQueue, removeAlertQueue, setFinishedAlerts, removeFinishedAlerts }

export default alertQueueReducer.reducer