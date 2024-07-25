import { createSlice } from "@reduxjs/toolkit";
import { request } from "../../utils";
import { UseDispatch } from "react-redux";
import { setToken as _setToken,getToken } from "../../utils";

export interface InitialState {
    token:string
}

const initialState :InitialState = {
    token:getToken()|| ''
}

const userReducer = createSlice({
    name:'user',
    initialState,
    reducers:{
        setToken(state,action){
            state.token = action.payload
            _setToken(action.payload)
        }
    }

})

const {setToken} = userReducer.actions

const fetchLogin =(loginForm:any)=>{
    return async (dispatch:ReturnType<UseDispatch>)=>{
        const res = await request.post('/users',loginForm)
        dispatch(setToken(res.data.id))
        console.log(res.data)
    }
}

export {setToken,fetchLogin}

export default userReducer.reducer