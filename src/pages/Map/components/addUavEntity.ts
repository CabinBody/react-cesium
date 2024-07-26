import { Transforms, Viewer, Color } from 'cesium'

const addUavEntity = (viewer: Viewer, dataPrimitive: any,) => {
    //添加默认的无人机实体
    if (dataPrimitive.cartesianPointList) {
        for (let index = 0; index < dataPrimitive.cartesianPointList.length; index++) {
            let position = dataPrimitive.cartesianPointList[index]
            if (dataPrimitive.hprList) {
                // console.log(dataPrimitive.hprList)
                let hpr = dataPrimitive.hprList[index]
                viewer.entities.add({
                    id: dataPrimitive.origin[index].id,
                    name: 'UAV',
                    position: position,
                    model: {
                        uri: '../../../../public/UAV.glb',
                        minimumPixelSize: 42,
                    },
                    orientation: Transforms.headingPitchRollQuaternion(position, hpr)
                });
                // console.log(dataPrimitive.origin[index].id)
            }
        }
    }
    //在无人周围生成场 半径100000
    let UAVRadius = 100000
    // console.log(viewer.entities)
    let entities = viewer.entities.values
    entities.forEach((entity) => {
        viewer.entities.add({
            position: entity.position,
            ellipse: {
                semiMinorAxis: UAVRadius,
                semiMajorAxis: UAVRadius,
                material: Color.RED.withAlpha(0.5), // 半透明绿色填充
                // outline: true,
                // outlineColor: Cesium.Color.BLACK
            }
        })
    })
}

export default addUavEntity