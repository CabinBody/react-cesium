import { createSlice } from "@reduxjs/toolkit";

const initialState :EntityData = {
    origin: null
}

const currentEntityReducer = createSlice({
    name:'entity',
    initialState,
    reducers:{
        getEntityData(state,action){
            state.origin = action.payload
        }
    }

})

const {getEntityData} = currentEntityReducer.actions


export {getEntityData}

export default currentEntityReducer.reducer