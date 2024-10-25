import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pageName: '首页'
}

const pageSwitchReducer = createSlice({
    name: 'pageSwitch',
    initialState,
    reducers: {
        setPage(state, action) {
            state.pageName = action.payload
        }
    }

})

const { setPage } = pageSwitchReducer.actions

export { setPage }

export default pageSwitchReducer.reducer