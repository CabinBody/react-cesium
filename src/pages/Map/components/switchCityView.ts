import * as Cesium from 'cesium'

const switchCityView = (viewer: Cesium.Viewer, province: string, city: string) => {


    Cesium.GeoJsonDataSource.load(`../../../../public/Province/${province}.json`, {
        fill: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3),
        stroke: Cesium.Color.fromCssColorString('#FFDEAD'),
        strokeWidth: 2,
    }).then((dataSource) => {
        // viewer.dataSources.add(dataSource)

        const entities = dataSource.entities.values

        const targetCityDs = new Cesium.CustomDataSource(city)

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.properties && entity.properties.name && entity.properties.name.getValue() === city) {
                // 将目标市的实体添加到 cityDataSource
                targetCityDs.entities.add(entity)
                // viewer.camera.flyTo({
                //     destination: centroid,
                //     orientation: {
                //         heading: Cesium.Math.toRadians(0), // 水平方向角度
                //         pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
                //         roll: 0.0 // 滚动角度
                //     },
                //     duration: 1
                // });

            }
        }
        viewer.dataSources.add(targetCityDs)

        viewer.flyTo(targetCityDs, {
            duration: 1,
            maximumHeight: 500000,
            offset:{
                heading: Cesium.Math.toRadians(0), // 水平方向角度
                pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
                range: 500000 // 滚动角度
            }
        })
        viewer.scene.screenSpaceCameraController.enableZoom = false; // 禁用缩放
        viewer.scene.screenSpaceCameraController.enableRotate = true; // 禁用旋转


    })
}
export default switchCityView