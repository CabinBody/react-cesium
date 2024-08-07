import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import addUavEntity from './addUavEntity'

const switchCityView = (viewer: Cesium.Viewer, province: string, city: string, bottomContainerRef: any) => {

    // viewer.scene.mode = Cesium.SceneMode.SCENE2D
    Cesium.GeoJsonDataSource.load(`../../../../public/Province/${province}.json`, {
        fill: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.1),
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
            }
        }
        viewer.dataSources.add(targetCityDs)
        bottomContainerRef.current.push(targetCityDs)

        viewer.flyTo(targetCityDs, {
            duration: 1,
            maximumHeight: 400000,
            offset: {
                heading: Cesium.Math.toRadians(0), // 水平方向角度
                pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
                range: 400000 // 滚动角度
            }
        })
        // viewer.scene.screenSpaceCameraController.enableZoom = false; // 禁用缩放
        viewer.scene.screenSpaceCameraController.enableRotate = true; // 禁用旋转
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 30000;//相机的高度的最小值 
        // viewer.scene.screenSpaceCameraController.enableTranslate = true; // 禁用平移

        viewer.scene.globe.show = true
        addUavEntity(viewer, bottomContainerRef, province, city)


    })
}
export default switchCityView