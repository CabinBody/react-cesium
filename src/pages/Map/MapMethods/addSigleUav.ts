import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { UAV_MODULE } from './setting'
import { AlertQueueState, setAlertQueue } from '../../../store/modules/alertQueueReducer'
import { RootDispatch } from '../../../store'

const addSigleUav = (
    viewer: Cesium.Viewer,
    bottomContainerRef: any,
    dispatch: RootDispatch,
    finishedAlerts: AlertQueueState[],
) => {

    //将航线、无人机、地点实体列表存入bottomContainerRef
    viewer.clock.shouldAnimate = true;
    const flightDuration = 10

    const uavLogin = (turthPosition: Cesium.Cartesian3[], prePosition: Cesium.Cartesian3[], uavId: string) => {
        let startTime = viewer.clock.currentTime
        //生成起点终点和预定路径
        const startPoint = viewer.entities.add({
            id: `startPoint-U${uavId}`,
            name: 'startPoint',
            position: prePosition[0],
            point: {
                pixelSize: 10,
                color: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
            }
        })
        bottomContainerRef.current.push(startPoint)
        const endPoint = viewer.entities.add({
            id: `endPoint-U${uavId}`,
            name: 'endPoint',
            position: prePosition[prePosition.length - 1],
            point: {
                pixelSize: 10,
                color: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
            }
        })
        bottomContainerRef.current.push(endPoint)

        //生成预定路径
        const prePath = viewer.entities.add({
            id: `prePath-U${uavId}`,
            name: 'prePath',
            polyline: {
                positions: [prePosition[0], prePosition[prePosition.length - 1]],
                width: 5,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.WHITE.withAlpha(0.2),
                    glowPower: 0.1,
                }),
            }
        })
        bottomContainerRef.current.push(prePath)


        // 生成现实路径
        generateCube(prePosition[0], prePosition[prePosition.length - 1], 500, prePosition)

        // 初始化速度property
        let preVelocityProperty = new Cesium.SampledPositionProperty();
        let velocityProperty = new Cesium.SampledPositionProperty();

        let target = finishedAlerts.find(item => item.id == uavId)
        // console.log(target,finishedAlerts)
        for (let i = 0; i < turthPosition.length; i++) {
            let time = Cesium.JulianDate.addSeconds(startTime, i * flightDuration, new Cesium.JulianDate())
            velocityProperty.addSample(time, turthPosition[i])
        }
        for (let i = 0; i < prePosition.length - 1; i++) {
            let time = Cesium.JulianDate.addSeconds(startTime, i * flightDuration, new Cesium.JulianDate())
            preVelocityProperty.addSample(time, prePosition[i])
        }
        let velocityOrientation = new Cesium.VelocityOrientationProperty(velocityProperty)
        //生成无人机实体
        let isDispatchMessage = false
        const uavEntity = viewer.entities.add({
            id: uavId,
            name: 'UAV',
            position: velocityProperty,
            model: {
                uri: UAV_MODULE,
                scale: scaleCallbackByProperty(800, velocityProperty),
            },
            orientation: velocityOrientation,
            label: {
                text: new Cesium.CallbackProperty(() => {
                    let now = velocityProperty.getValue(viewer.clock.currentTime)
                    let pre = preVelocityProperty.getValue(viewer.clock.currentTime)
                    let isSamePath = true
                    if (now != undefined || pre != undefined) {
                        isSamePath = Cesium.Cartesian3.equals(now, pre)
                    }

                    if (isSamePath) {
                        return ''
                    }
                    else {
                        if (!isDispatchMessage) {
                            sendMessage(uavId)
                            isDispatchMessage = true
                        }
                        return `${target ? target.title : '飞行异常'}`
                    }
                }, false),
                font: '16px Helvetica',
                outlineWidth: 2,
                outlineColor: Cesium.Color.fromCssColorString('#871212').withAlpha(0.5),
                fillColor: Cesium.Color.fromCssColorString('#871212').withAlpha(1),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -30)
            },
            path: {
                resolution: 1,
                width: 20,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.5),
                    glowPower: 0.3,
                    taperPower: 1,
                }),
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 3000 // Show the path behind the entity
            }
        })
        bottomContainerRef.current.push(uavEntity)
    }

    // 发送错误信息
    const sendMessage = (id: string) => {
        const message: AlertQueueState = {
            id: id,
            title: '飞行异常',
            content: '飞行路线与预定路线不一致',
            isFinished: false
        }
        dispatch(setAlertQueue(message))
    }
    // // 连续点生成器
    // const generateCoordinates = (startLon: number, startLat: number, endLon: number, endLat: number, height: number, numPoints: number) => {
    //     const coordinates = [];
    //     const stepLon = (endLon - startLon) / (numPoints - 1);
    //     const stepLat = (endLat - startLat) / (numPoints - 1);

    //     for (let i = 0; i < numPoints; i++) {
    //         let lon = startLon + stepLon * i;
    //         let lat = startLat + stepLat * i;
    //         coordinates.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
    //     }

    //     return coordinates;
    // }

    // 生成长方体
    const generateCube = (start: Cesium.Cartesian3, end: Cesium.Cartesian3, radio: number, flightPath: Cesium.Cartesian3[]) => {

        // 计算方向向量
        let direction = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3());
        let length = Cesium.Cartesian3.magnitude(direction); // 获取长度
        let center = Cesium.Cartesian3.add(start, end, new Cesium.Cartesian3());
        center = Cesium.Cartesian3.multiplyByScalar(center, 0.5, new Cesium.Cartesian3()); // 中心点

        // 用于计算速度方向的属性
        let velocityProperty = new Cesium.SampledPositionProperty();
        for (let i = 0; i < flightPath.length - 1; i++) {
            let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * flightDuration, new Cesium.JulianDate())
            velocityProperty.addSample(time, flightPath[i])
        }
        let velocityOrientation = new Cesium.VelocityOrientationProperty(velocityProperty)
        let orientation = velocityOrientation.getValue(viewer.clock.currentTime)

        let cubePath = viewer.entities.add({
            id: 'cubePath',
            name: 'cubePath',
            position: center,
            orientation: orientation,
            box: {
                dimensions: new Cesium.Cartesian3(length, radio, radio),
                material: Cesium.Color.YELLOW.withAlpha(0.2),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10, 50000)
                show: new Cesium.CallbackProperty(() => {
                    let currentHeight = viewer.camera.positionCartographic.height
                    if (currentHeight < 10000) {
                        return true
                    }
                    return false
                }, false)
            }
        })
        bottomContainerRef.current.push(cubePath)
    }

    // 比例缩放回调函数


    function scaleCallbackByPosition(scaleBasic: number, uavPos: Cesium.Cartesian3): Cesium.CallbackProperty {
        return (new Cesium.CallbackProperty(() => {
            // 获取相机的经度、纬度和高度
            let cameraCartographic = viewer.camera.positionCartographic;
            let cameraCartesian = Cesium.Cartesian3.fromRadians(
                cameraCartographic.longitude,
                cameraCartographic.latitude,
                cameraCartographic.height
            );

            // 获取实体的位置
            let entityPosition = Cesium.Cartographic.fromCartesian(uavPos);

            // 计算实体的地心距离
            let entityCartesianPosition = Cesium.Cartesian3.fromDegrees(entityPosition.longitude, entityPosition.latitude, entityPosition.height);
            // 计算相机与实体之间的距离
            let distance = Cesium.Cartesian3.distance(cameraCartesian, entityCartesianPosition);
            // 根据距离调整模型缩放比例
            if (distance < 10000) {
                return scaleBasic // 距离小于1000米时，使用原始大小
            } else if (distance >= 10000 && distance < 100000) {
                return (1.0 - (distance - 1000) / 4000) * scaleBasic; // 距离在1000米到10000米时，逐渐缩小
            } else {
                return 0.2 * scaleBasic; // 最小比例，确保在更大距离下仍可以看到
            }
        }, false))
    }

    function scaleCallbackByProperty(scaleBasic: number, velocityProperty: Cesium.SampledPositionProperty): Cesium.CallbackProperty {
        return (new Cesium.CallbackProperty(() => {
            // 获取相机的经度、纬度和高度
            let cameraCartographic = viewer.camera.positionCartographic;
            let cameraCartesian = Cesium.Cartesian3.fromRadians(
                cameraCartographic.longitude,
                cameraCartographic.latitude,
                cameraCartographic.height
            );

            // 获取实体的位置
            let entityPosition: Cesium.Cartographic = new Cesium.Cartographic();

            let cartesian3 = velocityProperty.getValue(viewer.clock.currentTime)
            if (cartesian3) {
                let position = Cesium.Cartographic.fromCartesian(cartesian3);
                entityPosition = position
            }

            // 计算实体的地心距离
            let entityCartesianPosition = Cesium.Cartesian3.fromDegrees(entityPosition.longitude, entityPosition.latitude, entityPosition.height);
            // 计算相机与实体之间的距离
            let distance = Cesium.Cartesian3.distance(cameraCartesian, entityCartesianPosition);
            // 根据距离调整模型缩放比例
            if (distance < 10000) {
                return scaleBasic // 距离小于1000米时，使用原始大小
            } else if (distance >= 10000 && distance < 100000) {
                return (1.0 - (distance - 1000) / 4000) * scaleBasic; // 距离在1000米到10000米时，逐渐缩小
            } else {
                return 0.2 * scaleBasic; // 最小比例，确保在更大距离下仍可以看到
            }
        }, false))
    }
    let towerPos = [
        Cesium.Cartesian3.fromDegrees(115.894979, 40.445044, 100),
        Cesium.Cartesian3.fromDegrees(116.127752, 40.520062, 100),
        Cesium.Cartesian3.fromDegrees(116.388209, 40.703046, 100),

    ]

    const wrongPath = [
        Cesium.Cartesian3.fromDegrees(115.89628, 40.48825),
        Cesium.Cartesian3.fromDegrees(116.15785, 40.53008),
        Cesium.Cartesian3.fromDegrees(116.38632, 40.69127)
    ]
    const rightPath = [
        Cesium.Cartesian3.fromDegrees(115.89628, 40.48825),
        Cesium.Cartesian3.fromDegrees(116.15785, 40.53008),
        Cesium.Cartesian3.fromDegrees(116.47147, 40.57863)
    ]


    uavLogin(wrongPath, rightPath, 'U001')

    // 信号塔实体
    for (let i = 0; i < 3; i++) {
        let tower = viewer.entities.add({
            name: 'tower',
            model: {
                uri: '../../../../public/tower.glb',
                scale: scaleCallbackByPosition(600, towerPos[i])
            },
            position: towerPos[i],
            ellipse: new Cesium.EllipseGraphics({
                show: false,
                semiMajorAxis: 20000,
                semiMinorAxis: 20000,
                material: Cesium.Color.ORANGE.withAlpha(0.2),
                height: 100
            })
        })
        bottomContainerRef.current.push(tower)
    }

    //--------------------------------------------------------------
    // // 信号线
    // bottomContainerRef.current.forEach((item: any) => {
    //     if (item.name == 'UAV') {
    //         for (let i = 0; i < 3; i++) {
    //             let signal = viewer.entities.add({
    //                 name: 'signal',
    //                 polyline: new Cesium.PolylineGraphics({
    //                     positions: new Cesium.CallbackProperty(() => {
    //                         return [
    //                             towerPos[i],
    //                             item.position.getValue(viewer.clock.currentTime)
    //                         ]
    //                     }, false),
    //                     width: new Cesium.CallbackProperty(() => {
    //                         let distance = Cesium.Cartesian3.distance(towerPos[i], item.position.getValue(viewer.clock.currentTime))
    //                         if (distance > 20000) {
    //                             return 0
    //                         } else {
    //                             return 3
    //                         }
    //                     }, false),
    //                     material: new Cesium.PolylineDashMaterialProperty({
    //                         color: Cesium.Color.YELLOW.withAlpha(0.3),
    //                         dashLength: 20
    //                     }),

    //                 }),
    //             })
    //             bottomContainerRef.current.push(signal)
    //         }
    //     }
    // })



    // if (demo == 2) {
    //     let areaC: any = null
    //     let areaY: any = null
    //     bottomContainerRef.current.forEach((item: any) => {
    //         if (item.name == '昌平区') {
    //             areaC = item
    //             areaC.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
    //         }
    //         if (item.name == '延庆区_entity') {
    //             areaY = item
    //         }
    //     })
    //     if (areaC && areaY) {

    //         const clock = viewer.clock;
    //         // console.log(areaC, areaY)
    //         // 监听时间变化事件
    //         let startTime = viewer.clock.startTime;
    //         clock.onTick.addEventListener(function (clock) {
    //             // 获取当前时间
    //             const currentTime = clock.currentTime;
    //             if (currentTime.secondsOfDay - startTime.secondsOfDay < 20) {
    //                 areaC.show = false
    //                 areaY.show = true
    //             }
    //             if (currentTime.secondsOfDay - startTime.secondsOfDay > 20) {
    //                 areaC.show = true
    //                 // areaC.polygon.material = Cesium.Color.GRAY
    //             }

    //         });

    //         let crediblePathEntity = viewer.entities.add({
    //             name: 'crediblePath',
    //             polyline: {
    //                 positions: overpassPath,
    //                 width: 20,
    //                 material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(1)),
    //                 clampToGround: false
    //             }
    //         })
    //         bottomContainerRef.current.push(crediblePathEntity)


    //         // 可信飞机动画
    //         let positionPropertyC = new Cesium.SampledPositionProperty()
    //         for (let i = 0; i < 3; i++) {
    //             let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
    //             positionPropertyC.addSample(time, overpassPath[i])
    //         }

    //         // 可信飞机
    //         let uavCredible = viewer.entities.add({
    //             id: 'CredibleUav',
    //             name: 'UAV',
    //             position: positionPropertyC,
    //             model: {
    //                 uri: UAV_MODULE,
    //                 minimumPixelSize: 80,
    //             },
    //             path: {
    //                 resolution: 1,
    //                 material: new Cesium.PolylineDashMaterialProperty({
    //                     color: Cesium.Color.GREEN,
    //                     dashLength: 30
    //                 }),
    //                 width: 3,
    //                 leadTime: 0, // Show the path ahead of the entity
    //                 trailTime: 3000 // Show the path behind the entity
    //             },
    //             orientation: new Cesium.VelocityOrientationProperty(positionPropertyC),
    //             label: {
    //                 text: new Cesium.CallbackProperty(() => {
    //                     if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 21&&viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay>20) {
    //                         cityRef.current = false
    //                     }
    //                     if (cityRef.current == true) {
    //                         return '可信无人机'
    //                     } else {
    //                         return '超越管辖范围'
    //                     }
    //                 }, false),
    //                 font: '24px Helvetica',
    //                 // fillColor: Cesium.Color.RED,
    //                 fillColor: new Cesium.CallbackProperty(() => {
    //                     if (cityRef.current == true) {
    //                         return Cesium.Color.GREEN;
    //                     } else {
    //                         return Cesium.Color.GRAY;
    //                     }
    //                 }, false),
    //                 outlineColor: Cesium.Color.BLACK,
    //                 outlineWidth: 10,
    //                 verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //                 pixelOffset: new Cesium.Cartesian2(0, -40)
    //             },
    //         });
    //         bottomContainerRef.current.push(uavCredible)


    //         // 生成信号塔
    //         for (let i = 0; i < 3; i++) {
    //             let tower = viewer.entities.add({
    //                 name: 'tower',
    //                 model: {
    //                     uri: '../../../../public/tower.glb',
    //                     minimumPixelSize: 150,
    //                     scale: 1.0, // 调整模型大小
    //                 },
    //                 position: towerPos[i],
    //                 ellipse: new Cesium.EllipseGraphics({
    //                     show: false,
    //                     semiMajorAxis: 20000,
    //                     semiMinorAxis: 20000,
    //                     material: Cesium.Color.ORANGE.withAlpha(0.2),
    //                     height: 100
    //                 })
    //             })
    //             bottomContainerRef.current.push(tower)
    //         }

    //         // 信号线
    //         bottomContainerRef.current.forEach((item: any) => {
    //             if (item.name == 'UAV') {

    //                 for (let i = 0; i < 3; i++) {
    //                     let signal = viewer.entities.add({
    //                         name: 'signal',
    //                         polyline: new Cesium.PolylineGraphics({
    //                             positions: new Cesium.CallbackProperty(() => {
    //                                 return [
    //                                     towerPos[i],
    //                                     item.position.getValue(viewer.clock.currentTime)
    //                                 ]
    //                             }, false),
    //                             width: new Cesium.CallbackProperty(() => {
    //                                 let distance = Cesium.Cartesian3.distance(towerPos[i], item.position.getValue(viewer.clock.currentTime))
    //                                 if (distance > 20000) {
    //                                     return 0
    //                                 } else {
    //                                     return 3
    //                                 }
    //                             }, false),
    //                             material: new Cesium.PolylineDashMaterialProperty({
    //                                 color: Cesium.Color.YELLOW.withAlpha(0.3),
    //                                 dashLength: 20
    //                             }),

    //                         }),
    //                     })
    //                     bottomContainerRef.current.push(signal)
    //                 }
    //             }
    //         })
    //     }

    // }
    // if (demo == 3) {
    //     let areaC: any = null
    //     let areaY: any = null
    //     bottomContainerRef.current.forEach((item: any) => {
    //         if (item.name == '昌平区') {
    //             areaC = item
    //             areaC.show = false
    //             areaC.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
    //         }
    //         if (item.name == '延庆区_entity') {
    //             areaY = item
    //         }
    //     })
    //     let crediblePathEntity = viewer.entities.add({
    //         name: 'crediblePath',
    //         polyline: {
    //             positions: CrediblePath,
    //             width: 20,
    //             material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(0.5)),
    //             clampToGround: false
    //         }
    //     })
    //     bottomContainerRef.current.push(crediblePathEntity)

    //     // 可信飞机动画
    //     let positionPropertyC = new Cesium.SampledPositionProperty()
    //     for (let i = 0; i < 6; i++) {
    //         let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 10, new Cesium.JulianDate())
    //         positionPropertyC.addSample(time, getAwayPath[i])
    //     }

    //     // 可信飞机
    //     let uavCredible = viewer.entities.add({
    //         id: 'CredibleUav',
    //         name: 'UAV',
    //         position: positionPropertyC,
    //         model: {
    //             uri: UAV_MODULE,
    //             minimumPixelSize: 80,
    //         },
    //         path: {
    //             resolution: 1,
    //             material: new Cesium.PolylineDashMaterialProperty({
    //                 color: new Cesium.CallbackProperty(() => {
    //                     if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 10) {

    //                         return Cesium.Color.GREEN
    //                     } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 30) {

    //                         return Cesium.Color.YELLOW
    //                     } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
    //                         return Cesium.Color.GREEN
    //                     } else {
    //                         return Cesium.Color.YELLOW
    //                     }
    //                 }, false),
    //                 dashLength: 30
    //             }),
    //             width: 3,
    //             leadTime: 0, // Show the path ahead of the entity
    //             trailTime: 3000 // Show the path behind the entity
    //         },
    //         orientation: new Cesium.VelocityOrientationProperty(positionPropertyC),
    //         label: {
    //             text: new Cesium.CallbackProperty(() => {
    //                 if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 10) {

    //                     return '可信无人机'
    //                 } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 30) {

    //                     return '区域遣返，重新规划'
    //                 } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
    //                     return '可信无人机'
    //                 } else {
    //                     return '区域迫降'
    //                 }
    //             }, false),
    //             font: '24px Helvetica',
    //             // fillColor: Cesium.Color.RED,
    //             fillColor: new Cesium.CallbackProperty(() => {
    //                 if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 10) {

    //                     return Cesium.Color.GREEN
    //                 } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 30) {

    //                     return Cesium.Color.YELLOW
    //                 } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
    //                     return Cesium.Color.GREEN
    //                 } else {
    //                     return Cesium.Color.YELLOW
    //                 }
    //             }, false),
    //             outlineColor: Cesium.Color.BLACK,
    //             outlineWidth: 10,
    //             verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //             pixelOffset: new Cesium.Cartesian2(0, -40)
    //         },
    //     });
    //     bottomContainerRef.current.push(uavCredible)
    // }

}

export default addSigleUav