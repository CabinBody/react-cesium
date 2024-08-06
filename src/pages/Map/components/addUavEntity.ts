import * as Cesium from 'cesium'
import { getDataPrimitive } from './methodsRepo'

const addUavEntity = (
    viewer: Cesium.Viewer, 
    bottomContainerRef: any, 
    province: string, 
    city: string
) => {
    //添加默认的无人机实体
    const dataPrimitive = getDataPrimitive(province,city)
    

    if (dataPrimitive.cartesianPointList) {
        for (let index = 0; index < dataPrimitive.cartesianPointList.length; index++) {
            let position = dataPrimitive.cartesianPointList[index]
            if (dataPrimitive.hprList) {
                // console.log(dataPrimitive.hprList)
                let hpr = dataPrimitive.hprList[index]
                let uav = viewer.entities.add({
                    id: dataPrimitive.origin[index].id,
                    name: 'UAV',
                    position: position,
                    model: {
                        uri: '../../../../public/UAV.glb',
                        minimumPixelSize: 32,
                    },
                    orientation: Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
                });
                bottomContainerRef.current.push(uav)
                // console.log(dataPrimitive.origin[index].id)
            }
        }
    }
    //在无人周围生成场 半径100000
    let UAVRadius = 100
    // console.log(viewer.entities)
    let entities = viewer.entities.values
    entities.forEach((entity) => {
        let radio = viewer.entities.add({
            position: entity.position,
            ellipse: {
                semiMinorAxis: UAVRadius,
                semiMajorAxis: UAVRadius,
                material: Cesium.Color.RED.withAlpha(0.5), // 半透明绿色填充
                // outline: true,
                // outlineColor: Cesium.Color.BLACK
            }
        })
        bottomContainerRef.current.push(radio)
    })
}

export default addUavEntity