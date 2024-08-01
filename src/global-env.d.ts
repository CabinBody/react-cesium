/// <reference types="vite/client" />
import ''


// 每个数据点的坐标
export type Point = {
    province?:string
    id: number
    longitude?: number
    latitude?: number
    height?: number
    degree?: number
    pitch?: number
    roll?: number
    uavCount?:number
}
// 浮窗的屏幕坐标
export interface PopXY {
    x: number;
    y: number;
}

export interface DataFrame {
    origin:Point | Point[] | any
    hprList?:any[]
    cartesianPointList?:Cesium.Cartesian3[]
    [key: string]: any
}
// 鼠标点击事件
export interface Mouse {
    viewer:Cesium.Viewer
    setLongitude:React.Dispatch<React.SetStateAction<number>>
    setLatitude:React.Dispatch<React.SetStateAction<number>>
    setPickUavId:React.Dispatch<React.SetStateAction<string>>
    setTarget:React.Dispatch<React.SetStateAction<Point>>
    dataPrimitive:DataFrame
    uavCountList:any
}

// 全局变量声明
declare global {

    // 每个实体携带的数据
    interface EntityData {
        origin?: Point | null
    }
}
