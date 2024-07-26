
// import * as Cesium from "cesium";
// import React, { useEffect, useRef, useState } from "react";
// import './CesiumMap.less'
// import { getDataPrimitive } from './utils/PointGenerater'
// import { getProvinceList } from "./utils/GetProvince";
// import getCameraParameters from "./utils/GetCameraParam";

// //既定的相机高度、经度、纬度
// const DEFAULTCAMERAHEIGHT = 6691711.819523133
// const DEFAULTCAMERALONGITUDE = 103.68957249677412
// const DEFAULTCAMERAALTITUDE = 34.285856181062144



// const CESIUMTOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOWQ3ZDc5Zi0yZjM2LTRhZWMtOWM3Ny0yMjI1NDUwNmU1Y2IiLCJpZCI6MjI5NjgyLCJpYXQiOjE3MjE1NDk3NjR9.I6PpMJnwxUZhQTq_pdB2F2t4S3uugj9E1xNXxcWtC1E'
// // const TIDITUTOKEN = '32887750f8cf1c0d28e57dd13fd9c9b2'
// // const targetLongitude = 108.9109251
// // const targetLatitude = 30.3731565

// //两个因为版本问题更新的新方法
// const addWorldTerrainAsync = async (viewer: Cesium.Viewer) => {
//   try {
//     const terrainProvider = await Cesium.createWorldTerrainAsync({
//       requestVertexNormals: true,
//       requestWaterMask: true,
//     });
//     viewer.terrainProvider = terrainProvider;
//   } catch (error) {
//     // console.log('Failed to add world imagery: ', { error });
//   }
// };

// const addOsmBuildingsAsync = async (viewer: Cesium.Viewer) => {
//   try {
//     const osmBuildings = await Cesium.createOsmBuildingsAsync();
//     viewer.scene.primitives.add(osmBuildings);
//   } catch (error) {
//     // console.log('Failed to add OSM buildings: ', { error });
//   }
// };


// const CesiumMap: React.FC = () => {
//   const [longitude_ALL, setLongitude] = useState(0)
//   const [altitude_ALL, setAltitude] = useState(0)
//   const cesiumContainerRef = useRef<HTMLDivElement>(null)


//   // 处理键盘按下事件
//   const dataPrimitive = getDataPrimitive()
//   const province = getProvinceList()

//   useEffect(() => {

//     if (!cesiumContainerRef.current) return;
//     // 初始化token
//     Cesium.Ion.defaultAccessToken = CESIUMTOKEN
//     // 初始化Cesium Viewer
//     const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
//       // terrain: Cesium.Terrain.fromWorldTerrain(),
//       // 禁用infoBox
//       infoBox: false,
//       geocoder: false,
//       homeButton: false,
//       sceneModePicker: false,
//       baseLayerPicker: false,
//       fullscreenButton: false,
//       navigationHelpButton: false,
//       animation: false,
//       timeline: false,
//       vrButton: false,
//     });

//     // 设置相机参数
//     viewer.camera.setView({
//       destination: Cesium.Cartesian3.fromDegrees(DEFAULTCAMERALONGITUDE, DEFAULTCAMERAALTITUDE, DEFAULTCAMERAHEIGHT),
//       orientation: {
//         heading: Cesium.Math.toRadians(0), // 水平方向角度
//         pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
//         roll: 0.0 // 滚动角度
//       }
//     });

//     //   viewer.camera.lookAt(
//     //     Cesium.Cartesian3.fromDegrees(103.68957249677412, 34.285856181062144),
//     //     new Cesium.HeadingPitchRange(
//     //         Cesium.Math.toRadians(0.0),  // heading
//     //         Cesium.Math.toRadians(-90.0), // pitch
//     //         6691711.819523133             // range
//     //     )
//     // );

//     // 添加内置的地形和白膜建筑物
//     addWorldTerrainAsync(viewer)
//     addOsmBuildingsAsync(viewer)

//     // 添加第三方图层
//     viewer.dataSources.add(Cesium.GeoJsonDataSource.load("../public/tst.json", {
//       fill: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3),
//       stroke: Cesium.Color.fromCssColorString('#FFDEAD'),
//       strokeWidth: 2,
//     }))

//     // 取消默认的点击事件和控制视角
//     viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
//     viewer.scene.screenSpaceCameraController.maximumZoomDistance = 6791711.819523133;
//     viewer.scene.screenSpaceCameraController.minimumZoomDistance = 900000;//相机的高度的最小值  //相机高度的最大值
//     viewer.scene.screenSpaceCameraController.enableRotate = false; // 禁用旋转
//     // viewer.scene.screenSpaceCameraController.enableZoom = false; // 禁用缩放
//     viewer.scene.screenSpaceCameraController.enableLook = false; // 禁用视角调整
//     viewer.scene.screenSpaceCameraController.enableTilt = false; // 禁用倾斜
//     viewer.scene.screenSpaceCameraController.enableTranslate = false; // 禁用平移
//     //
//     // viewer.scene.globe.show = false
//     viewer.scene.skyAtmosphere.show = false
//     viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#2F4F4F').withAlpha(0.5)
//     viewer.scene.skyBox.show = false
//     viewer.scene.moon.show = false

//     //添加默认的无人机实体
//     if (dataPrimitive.cartesianPointList) {
//       for (let index = 0; index < dataPrimitive.cartesianPointList.length; index++) {
//         let position = dataPrimitive.cartesianPointList[index]
//         if (dataPrimitive.hprList) {
//           // console.log(dataPrimitive.hprList)
//           let hpr = dataPrimitive.hprList[index]
//           viewer.entities.add({
//             id: dataPrimitive.origin[index].id,
//             name: `UAV ${index + 1}`,
//             position: position,
//             model: {
//               uri: '../public/UAV.glb',
//               minimumPixelSize: 42,
//             },
//             orientation: Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
//           });
//         }
//       }
//     }

//     //在无人周围生成场
//     let UAVRadius = 100000
//     // console.log(viewer.entities)
//     let entities = viewer.entities.values
//     entities.forEach((entity) => {
//       viewer.entities.add({
//         position: entity.position,
//         ellipse: {
//           semiMinorAxis: UAVRadius,
//           semiMajorAxis: UAVRadius,
//           material: Cesium.Color.RED.withAlpha(0.5), // 半透明绿色填充
//           // outline: true,
//           // outlineColor: Cesium.Color.BLACK
//         }
//       })
//     })



//     // 添加各省的名称
//     province.forEach(item => {
//       if (item.properties.centroid) {
//         viewer.entities.add({
//           position: Cesium.Cartesian3.fromDegrees(item.properties.centroid[0], item.properties.centroid[1]), // 上海的经纬度
//           label: {
//             text: item.properties.name,
//             font: '24px Helvetica',
//             fillColor: Cesium.Color.WHITE,
//             outlineColor: Cesium.Color.BLACK,
//             outlineWidth: 2,
//             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//             verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//             scaleByDistance: new Cesium.NearFarScalar(1000.0, 3.0, 5000.0, 0.7)
//           }
//         });
//       }
//     });





//     // 添加点击事件
//     let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

//     handler.setInputAction(function onLeftClick(event: any) {
//       let pickObject = viewer.scene.pick(event.position)

//       if (Cesium.defined(pickObject)) {
//         console.log('点击了对象:', pickObject.id);
//         getCameraParameters(viewer)
//       } else {
//         console.log("pick nothing")
//       }

//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)


//     // 添加鼠标移动控制镜头移动
//     handler.setInputAction(function (movement: any) {
//       let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//       let percise = 0

//       let currentLogi = DEFAULTCAMERALONGITUDE
//       let currentAlti = DEFAULTCAMERAALTITUDE
//       if (cartesian) {
//         let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
//         let longitude = Cesium.Math.toDegrees(cartographic.longitude)
//         let latitude = Cesium.Math.toDegrees(cartographic.latitude)
//         // 相机和鼠标一起动
//         setLongitude(longitude)
//         setAltitude(latitude)
//         percise = Math.abs((currentLogi - longitude + currentAlti - latitude))

//         const currentHeight = getCameraParameters(viewer).height
//         if (longitude < 160 && longitude > 75 && latitude > -5 && latitude < 54 && percise > 2 && currentHeight > 6691711) {
//           viewer.camera.setView({
//             destination: Cesium.Cartesian3.fromDegrees(
//               DEFAULTCAMERALONGITUDE - (DEFAULTCAMERALONGITUDE - longitude) * 0.2,
//               DEFAULTCAMERAALTITUDE - (DEFAULTCAMERAALTITUDE - latitude) * 0.5,
//               DEFAULTCAMERAHEIGHT
//             ),
//             // duration: 1, // 飞行的持续时间（秒）
//             // pitchAdjustHeight: -10000, // 调整俯仰角度时的高度（可选）
//             // endTransform: Cesium.Matrix4.IDENTITY, // 最终的变换矩阵（可选）
//             // maximumHeight: DEFAULTCAMERAHEIGHT, // 飞行过程中的最大高度（可选）
//             // easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT // 缓动函数（可选）
//           });
//           currentAlti = latitude
//           currentLogi = longitude
//           percise = 0
//         }

//         // console.log(percise)

//       }

//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);





//     console.log('模型加载完毕~~~')
//     return () => {
//       viewer.destroy()
//     }
//   }, [])



//   return (
//     <div className="container">
//       <div className="hide">TEST</div>
//       <div className="coordinate">Longitude: {longitude_ALL} Altitude:{altitude_ALL}</div>
//       <div className="cesiumContainer" ref={cesiumContainerRef} />
//     </div>
//   )
// }

// export default CesiumMap;

// 改用了router