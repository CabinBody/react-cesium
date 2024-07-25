import { createSlice } from "@reduxjs/toolkit";
import { UseDispatch } from 'react-redux'
import axios from "axios";


export interface Point {
    longitude: number
    latitude: number
    height: number
}

export interface InitialState {
    coordinate: Point[]
    province:any
}

const initialState: InitialState = {
    coordinate: [],
    province:{}
}


const CesiumeMapReducer = createSlice({
    name: 'cesiumMap',
    initialState,
    reducers: {
        getPointList(state: InitialState, action) {
            state.coordinate = action.payload
        },
        getProvince(state,action){
            state.province = action.payload
        }
    }
})

const { getPointList,getProvince } = CesiumeMapReducer.actions


const fetchPointList = (url: string) => {
    return async (dispatch: ReturnType<UseDispatch>) => {
        const res = await axios.get(url)
        dispatch(getPointList(res.data))
    }
}

const fetchProvince = () => {
    return async (dispatch: ReturnType<UseDispatch>) => {
        const res = await axios.get('../../public/tst.json')
        dispatch(getProvince(res.data))
    }
}



export { fetchPointList ,fetchProvince}

export default CesiumeMapReducer.reducer