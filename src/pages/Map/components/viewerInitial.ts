import * as Cesium from "cesium";
import { addWorldTerrainAsync, addOsmBuildingsAsync } from "./methodsRepo";
import {CESIUMTOKEN,DEFAULTCAMERALONGITUDE,DEFAULTCAMERALATITUDE,DEFAULTCAMERAHEIGHT} from './Setting'


const viewerInitial = (cesiumContainerRef: any) => {
    // 初始化Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        
        terrain: Cesium.Terrain.fromWorldTerrain(),
        // 禁用infoBox
        infoBox: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        vrButton: false,

    });
    // 初始化token
    Cesium.Ion.defaultAccessToken = CESIUMTOKEN

    // 设置相机参数
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT),
        orientation: {
            heading: Cesium.Math.toRadians(0), // 水平方向角度
            pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
            roll: 0.0 // 滚动角度
        }
    });


    // 添加内置的地形和白膜建筑物
    addWorldTerrainAsync(viewer)
    addOsmBuildingsAsync(viewer)

    // 添加第三方图层
    viewer.dataSources.add(Cesium.GeoJsonDataSource.load("../../../../tst.json", {
        fill: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3),
        stroke: Cesium.Color.fromCssColorString('#FFDEAD'),
        strokeWidth: 2,
    }))


    // 取消默认的点击事件和控制视角
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 6791711.819523133;//相机高度的最大值
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 900000;//相机的高度的最小值  
    viewer.scene.screenSpaceCameraController.enableRotate = false; // 禁用旋转
    // viewer.scene.screenSpaceCameraController.enableZoom = false; // 禁用缩放
    viewer.scene.screenSpaceCameraController.enableLook = false; // 禁用视角调整
    viewer.scene.screenSpaceCameraController.enableTilt = false; // 禁用倾斜
    viewer.scene.screenSpaceCameraController.enableTranslate = false; // 禁用平移
    // 禁用默认的双击事件
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


    // 设置地球是否显示
    viewer.scene.globe.show = false
    viewer.scene.skyAtmosphere.show = false
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a1f44').withAlpha(0.5)
    viewer.scene.skyBox.show = false
    viewer.scene.moon.show = false

    return viewer
}

export default viewerInitial