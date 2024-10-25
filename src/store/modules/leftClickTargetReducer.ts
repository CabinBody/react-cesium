import { createSlice } from "@reduxjs/toolkit";

const initialState: EntityData = {
    entityInfo: {
        province: '',
        city:'',
        id: '',
        type:'',
        longitude: 0,
        latitude: 0,
        height: 0,
        degree: 0,
        pitch: 0,
        roll: 0,
        uavCount: 0,
        velocity:150
    },
    _province:'',
    _city:''
}

const leftClickTargetReducer = createSlice({
    name: 'onLeftClickTarget',
    initialState,
    reducers: {
        setEntityInfo(state, action) {
            state.entityInfo = action.payload
        },
        setEntityProvince(state, action) {
            state._province = action.payload
        },
        setEntityCity(state, action) {
            state._city = action.payload
        }
    }

})

const { setEntityInfo, setEntityProvince, setEntityCity } = leftClickTargetReducer.actions


export { setEntityInfo, setEntityProvince, setEntityCity }

export default leftClickTargetReducer.reducer