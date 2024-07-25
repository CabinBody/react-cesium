import * as Cesium from "cesium";
import random_points from '../../public/random_points.json'

interface DataFrame {
    origin:any
    hprList?:any[]
    cartesianPointList?:Cesium.Cartesian3[]
    [key: string]: any
}

export function getDataPrimitive() {
    const pointList = random_points
    const dataPrimitive: DataFrame = {
        origin : pointList,
        hprList:[],
    }

    const cartesianPointList = pointList.map((point) => Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.height))

    const hprList = [] as any[]
    pointList.map((item) => {
        const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(item.degree),0,0)
        // console.log(hpr)
        hprList.push(hpr)
     })
    // var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(60),0,0)
    
    dataPrimitive.hprList = hprList
    // console.log(dataPrimitive.origin)
    dataPrimitive.cartesianPointList = cartesianPointList

    return dataPrimitive
}










