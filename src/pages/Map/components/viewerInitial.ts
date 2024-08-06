import * as Cesium from "cesium";
import { DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT } from './Setting'
import loadResources from "./loadResources";
import addProvince from "./addProvince";
import { MAPBOX_USER } from "./Setting";


const viewerInitial = (viewer: Cesium.Viewer, topContainerRef: any) => {
    let layer = new Cesium.MapboxStyleImageryProvider({
        username: MAPBOX_USER.username,
        styleId: 'clzi16g9c00h501pr4mtt3owf',
        accessToken: MAPBOX_USER.token,
    })

    viewer.imageryLayers.addImageryProvider(layer)
    // 设置相机参数
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT),
        orientation: {
            heading: Cesium.Math.toRadians(0), // 水平方向角度
            pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
            roll: 0.0 // 滚动角度
        },
        duration: 1
    });


    // 添加第三方图层
    const mainMap = new Cesium.GeoJsonDataSource('mainMap')
    mainMap.load("../../../../public/china.json", {
        fill: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3),
        stroke: Cesium.Color.fromCssColorString('#FFDEAD'),
        strokeWidth: 2,
    })

    viewer.dataSources.add(mainMap)
    topContainerRef.current.push(mainMap)




    // 取消默认的点击事件和控制视角
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 6791711.819523133;//相机高度的最大值
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5000000;//相机的高度的最小值  
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

    const data = loadResources()

    // 中国省区市的坐标数据
    const province = data.province

    addProvince(viewer, province, topContainerRef)

}

export default viewerInitial