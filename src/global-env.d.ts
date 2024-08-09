/// <reference types="vite/client" />
import ''
import { RootDispatch } from "./store"

export type DataPoint = {
    name: string
    value:number
    cityList:any[]
}
// 每个数据点的坐标
export type Point = {
    province: string
    city: string
    id: string
    name?: string
    longitude?: number
    latitude?: number
    height?: number
    degree?: number
    pitch?: number
    roll?: number
    uavCount?: number
}
// 浮窗的屏幕坐标
export interface PopXY {
    x: number;
    y: number;
}

export interface DataFrame {
    origin: Point | Point[] | any
    hprList?: any[]
    cartesianPointList?: Cesium.Cartesian3[]
    [key: string]: any
}
// 鼠标点击事件
export interface Mouse {
    setheight: React.Dispatch<React.SetStateAction<number>>
    viewer: Cesium.Viewer
    setLongitude: React.Dispatch<React.SetStateAction<number>>
    setLatitude: React.Dispatch<React.SetStateAction<number>>
    setPickUavId: React.Dispatch<React.SetStateAction<string>>
    setTarget: React.Dispatch<React.SetStateAction<Point>>
    dataPrimitive: DataFrame | any
    uavCountList: DataPoint[]
}

export interface ConfinedArea {
    id: string
    timeSpan : string
    confineMethod:string
    subscription?:string
}

// 全局变量声明
declare global {

    // 每个实体携带的数据
    interface EntityData {
        origin?: Point | null
        province?: string
        city?: string
    }

    type Layer ='TOP'|'MEDIUM'|'BOTTOM'|'REALITY'

    interface CurrentLocation {
        layer:Layer
        province:string
        city:string
    }
}
