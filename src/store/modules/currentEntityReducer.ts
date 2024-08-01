import { createSlice } from "@reduxjs/toolkit";

const initialState: EntityData = {
    origin: {
        province: '北京市',
        city:'',
        id: 0,
        longitude: 0,
        latitude: 0,
        height: 0,
        degree: 0,
        pitch: 0,
        roll: 0,
        uavCount: 0
    },
    province: '',
    city: ''
}

const currentEntityReducer = createSlice({
    name: 'entity',
    initialState,
    reducers: {
        setEntityData(state, action) {
            state.origin = action.payload
        },
        setEntityProvince(state, action) {
            state.province = action.payload
        },
        setEntityCity(state, action) {
            state.city = action.payload
        }
    }

})

const { setEntityData, setEntityProvince, setEntityCity } = currentEntityReducer.actions


export { setEntityData, setEntityProvince, setEntityCity }

export default currentEntityReducer.reducer