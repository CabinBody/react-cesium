import { Point, DataFrame } from "../../../global-env";
import * as Cesium from "cesium";
import random_points from '../../../../public/virtual_UAV_DataPoint.json'
import provinceList from '../../../../public/china.json'



// 根据Id找到实体原始数据
const findItemById = (items: Point[], id: string): Point | undefined => {
    return items.find(item => item.id === id);
};

//两个因为版本问题更新的新方法 （1）
const addWorldTerrainAsync = async (viewer: Cesium.Viewer) => {
    try {
        const terrainProvider = await Cesium.createWorldTerrainAsync({
            requestVertexNormals: true,
            requestWaterMask: true,
        });
        viewer.terrainProvider = terrainProvider;
    } catch (error) {
        // console.log('Failed to add world imagery: ', { error });
    }
};
//两个因为版本问题更新的新方法 （2）
const addOsmBuildingsAsync = async (viewer: Cesium.Viewer) => {
    try {
        const osmBuildings = await Cesium.createOsmBuildingsAsync();
        viewer.scene.primitives.add(osmBuildings);
    } catch (error) {
        // console.log('Failed to add OSM buildings: ', { error });
    }
};

// 获取无人机飞行的笛卡尔坐标和hpr数据
function getDataPrimitive(province: string, city: string) {
    const data: any = random_points

    let targetP: any = data.find((item: any) => item.province == province)

    let probePoint:any = targetP.city.find((item: any) => item.city_name == city)
    let pointList: any[] = []
    if (probePoint) {
        pointList = probePoint.data_point
    }
    const dataPrimitive: DataFrame = {
        origin: pointList,
        hprList: [],
    }

    const cartesianPointList = pointList.map((point) => Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, 2000))

    const hprList = [] as any[]
    pointList.map((item) => {
        const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(item.degree), 0, 0)
        // console.log(hpr)
        hprList.push(hpr)
    })
    // let hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(60),0,0)

    dataPrimitive.hprList = hprList
    // console.log(dataPrimitive.origin)
    dataPrimitive.cartesianPointList = cartesianPointList

    return dataPrimitive
}


// 获取中国各省的坐标数据


function getProvinceList() {

    const pointList = provinceList.features

    return pointList
}

function getUavCountList() {
    const data: any = random_points

    let uavCount: any
    if (data) {
        uavCount = Object.entries(data).map((target: any) => ({
            name: target[1].province,
            value: target[1].province_count,
            cityList: target[1].city
        }));
        // console.log(uavCount)
    }
    else {
        uavCount = []
    }
    return uavCount
}


export {
    findItemById,
    addWorldTerrainAsync,
    addOsmBuildingsAsync,
    getDataPrimitive,
    getProvinceList,
    getUavCountList
}