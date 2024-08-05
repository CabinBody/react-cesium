// import { DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT } from './Setting'
// import * as Cesium from "cesium";
// import { Mouse } from '../../../global-env';
// import switchProvinceView from './switchProvinceView';
// import resetAll from './resetAll';


// 暂时不用单独的鼠标事件


// const addMouseActions = (props: Mouse) => {
//     const {
//         viewer,
//         setLongitude,
//         setLatitude,
//         setPickUavId,
//         setTarget,
//         uavCountList,
//         setheight,
//     } = props
//     const expandedProvinList = ['']
//     const currentLayer = ['TOP', 'MID', 'BOTTOM']
//     let nowLayer = currentLayer[1]


//     // 单击事件设置
//     let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
//     handler.setInputAction(function onLeftClick(click: any) {
//         let pickObject = viewer.scene.pick(click.position)
//         let position = new Cesium.Cartesian2(click.clientX, click.clientY);
//         let cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);

//         if (cartesian) {
//             let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
//             let longitude = Cesium.Math.toDegrees(cartographic.longitude)
//             let latitude = Cesium.Math.toDegrees(cartographic.latitude)
//             // 相机和鼠标一起动
//             setLongitude(longitude)
//             setLatitude(latitude)
//             let currentHeight = viewer.camera.positionCartographic.height
//             setheight(currentHeight)
//         }
//         if (Cesium.defined(pickObject)) {
//             // setPickId('')

//             if (pickObject.id) {
//                 if (pickObject.id.name == 'UAV') {
//                     // console.log('点击了对象:', pickObject.id);
//                     setPickUavId(pickObject.id.id)
//                     // let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
//                     // if (foundItem) {
//                     //     setTarget(item => ({
//                     //         ...item,
//                     //         id: foundItem.id,
//                     //         height: foundItem.height,
//                     //         longitude: foundItem.longitude,
//                     //         latitude: foundItem.latitude
//                     //     }))
//                     // }
//                 }
//                 else if (pickObject.id.properties.level._value == 'province') {
//                     setPickUavId('')
//                     // console.log('点击了对象:', pickObject.id.properties.level._value);
//                     let count = uavCountList.find(item => item.name == pickObject.id.name)
//                     if (count) {
//                         setTarget(item => ({
//                             ...item, // 保留之前的状态
//                             province: pickObject.id.name,
//                             id: pickObject.id.id,
//                             uavCount: count.value
//                         }))
//                     }
//                     else {
//                         setTarget(item => ({
//                             ...item, // 保留之前的状态
//                             province: pickObject.id.name,
//                             id: pickObject.id.id,
//                             uavCount: 0
//                         }))
//                     }
//                 }
//                 else if (pickObject.id.properties.level._value == 'city') {
//                     setTarget(item => ({
//                         ...item, // 保留之前的状态
//                         city: pickObject.id.name,
//                         id: pickObject.id.id,
//                         uavCount: 1
//                     }));


//                 }
//                 else {
//                     setPickUavId('')
//                 }
//             }
//         }
//         else {
//             setPickUavId('')
//         }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)


//     //移动鼠标事件设置
//     const highlightColor = new Cesium.Color(1.0, 1.0, 1.0, 0.5)
//     const defaultColor = Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3)
//     let highlightedEntity: any = null;
//     // 添加鼠标移动控制镜头移动
//     handler.setInputAction(function (movement: any) {
//         let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//         let pickedObject = viewer.scene.pick(movement.endPosition)
//         // let percise = 0
//         // let currentLogi = DEFAULTCAMERALONGITUDE
//         // let currentAlti = DEFAULTCAMERALATITUDE
//         if (cartesian) {
//             // let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
//             // let longitude = Cesium.Math.toDegrees(cartographic.longitude)
//             // let latitude = Cesium.Math.toDegrees(cartographic.latitude)
//             // // 相机和鼠标一起动
//             // setLongitude(longitude)
//             // setLatitude(latitude)
//             let currentHeight = viewer.camera.positionCartographic.height
//             // setheight(currentHeight)
//             if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon
//                 && currentHeight > 850000) {
//                 if (highlightedEntity !== pickedObject.id) {
//                     if (highlightedEntity) {
//                         highlightedEntity.polygon.material = defaultColor
//                     }
//                     highlightedEntity = pickedObject.id
//                     highlightedEntity.polygon.material = highlightColor
//                 }
//             } else if (highlightedEntity) {
//                 highlightedEntity.polygon.material = defaultColor
//                 highlightedEntity = null
//             }
//             // percise = Math.abs((currentLogi - longitude + currentAlti - latitude))
//             // if (longitude < 160 && longitude > 75 && latitude > -5 && latitude < 54 && percise > 2 && currentHeight > 6691711) {
//             //     viewer.camera.setView({
//             //         destination: Cesium.Cartesian3.fromDegrees(
//             //             DEFAULTCAMERALONGITUDE - (DEFAULTCAMERALONGITUDE - longitude) * 0.2,
//             //             DEFAULTCAMERALATITUDE - (DEFAULTCAMERALATITUDE - latitude) * 0.5,
//             //             DEFAULTCAMERAHEIGHT
//             //         ),
//             //     });
//             //     currentAlti = latitude
//             //     currentLogi = longitude
//             //     percise = 0
//             // }
//         }

//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


//     // 添加双击事件
//     handler.setInputAction((doubleClick: any) => {
//         let pickObject = viewer.scene.pick(doubleClick.position)
//         // console.log(pickObject)
//         if (Cesium.defined(pickObject)) {
//             if (pickObject.id.properties.level._value == 'province') {
//                 if (!expandedProvinList.find(item => item == pickObject.id.name)) {
//                     switchProvinceView(viewer, pickObject.id.name)
//                     expandedProvinList.push(pickObject.id.name)
//                 }
//             }
//             // console.log(pickObject)
//         }
//         else if (!Cesium.defined(pickObject)) {
//             // resetAll(viewer)
//             nowLayer = currentLayer[1]
//         }

//     }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

//     return handler
// }

// export default addMouseActions