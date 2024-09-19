import * as Cesium from "cesium";
import 'cesium/Widgets/widgets.css'
import { DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT } from './Setting'
import loadResources from "./loadResources";
import addProvince from "./addProvince";

const viewerInitial = (viewer: Cesium.Viewer, topContainerRef: any) => {
    
    // let building = new Cesium.MapboxStyleImageryProvider({
    //     username: MAPBOX_USER.username,
    //     styleId: 'clzjerkvb00kf01qyazpp8787',
    //     accessToken: MAPBOX_USER.token,
    // })

    // viewer.imageryLayers.addImageryProvider(building)

    // let layer = new Cesium.MapboxStyleImageryProvider({
    //     username: MAPBOX_USER.username,
    //     styleId: 'clzi16g9c00h501pr4mtt3owf',
    //     accessToken: MAPBOX_USER.token,
    // })

    // viewer.imageryLayers.addImageryProvider(layer)

    //天地图影像服务
    // let token = TIDITU_TOKEN;
    // // 服务域名
    // let tdtUrl = 'https://t{s}.tianditu.gov.cn/';
    // // 服务负载子域
    // let subdomains = ['0', '1', '2', '3', '4', '5', '6', '7'];
    // let imgMap = new Cesium.UrlTemplateImageryProvider({
    //     url: tdtUrl + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + token,
    //     subdomains: subdomains,
    //     tilingScheme: new Cesium.WebMercatorTilingScheme(),
    //     maximumLevel: 18
    // });
    // viewer.imageryLayers.addImageryProvider(imgMap)


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
    // 开启深度检测
    viewer.scene.globe.depthTestAgainstTerrain = false
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
    viewer.scene.sun.show = true


    // 设置动画时长
    viewer.clock.startTime = Cesium.JulianDate.fromDate(new Date());
    viewer.clock.stopTime = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 40, new Cesium.JulianDate());;
    viewer.clock.currentTime = viewer.clock.startTime.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
    viewer.clock.multiplier = 1;
    viewer.clock.shouldAnimate = false

    const data = loadResources()

    // 中国省区市的坐标数据
    const province = data.province

    addProvince(viewer, province, topContainerRef)

}

export default viewerInitial