import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { UAV_MODULE, AIR_MODULE } from './setting'

const addSigleUav = (
    viewer: Cesium.Viewer,
    bottomContainerRef: any,
) => {
    // 连续点生成器
    const generateCoordinates = (startLon: number, startLat: number, endLon: number, endLat: number, height: number, numPoints: number) => {
        const coordinates = [];
        const stepLon = (endLon - startLon) / (numPoints - 1);
        const stepLat = (endLat - startLat) / (numPoints - 1);

        for (let i = 0; i < numPoints; i++) {
            let lon = startLon + stepLon * i;
            let lat = startLat + stepLat * i;
            coordinates.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
        }

        return coordinates;
    }

    // 计算四元数
    const generateOrientation = (uavPos: Cesium.Cartesian3, targetPos: Cesium.Cartesian3) => {
        let direction = Cesium.Cartesian3.subtract(targetPos, uavPos, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(direction, direction);
        // 计算航向、俯仰和滚转（单位为弧度）
        let heading = Cesium.Math.toRadians(-40); // 计算航向
        let pitch = 0
        let roll = 0; // 假设不需要滚转，可以设为0

        let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
        // 计算四元数（orientation）
        let orientation = Cesium.Transforms.headingPitchRollQuaternion(uavPos, hpr);

        return orientation

    }

    // 生成长方体
    const generateCube = (start: Cesium.Cartesian3, end: Cesium.Cartesian3, radio: number) => {
        let _center = Cesium.Cartesian3.add(start, end, new Cesium.Cartesian3())
        _center = Cesium.Cartesian3.multiplyByScalar(_center, 0.5, new Cesium.Cartesian3())
        let _direction = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3())
        let _length = Cesium.Cartesian3.magnitude(_direction)
        // Cesium.Cartesian3.normalize(_direction, _direction)

        let heading = Cesium.Math.toRadians(-50); // 计算航向
        let pitch = 0
        let roll = 0; // 假设不需要滚转，可以设为0

        let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
        // 计算四元数（orientation）
        let orientation = Cesium.Transforms.headingPitchRollQuaternion(end, hpr);

        let cubePath = viewer.entities.add({
            name: 'cubePath',
            position: _center,
            orientation: orientation,
            box: {
                dimensions: new Cesium.Cartesian3(_length, radio, radio),
                material: Cesium.Color.YELLOW.withAlpha(0.2),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10, 10000)
            }
        })
        bottomContainerRef.current.push(cubePath)
    }

    const startCoordinate = [115.94272, 40.38082]
    const endCoordinate = [116.35755, 40.74757]
    const testStep = generateCoordinates(startCoordinate[0], startCoordinate[1], endCoordinate[0], endCoordinate[1], 2000, 100)

    let towerPos = [
        Cesium.Cartesian3.fromDegrees(115.894979, 40.445044, 100),
        Cesium.Cartesian3.fromDegrees(116.127752, 40.520062, 100),
        Cesium.Cartesian3.fromDegrees(116.388209, 40.703046, 100),

    ]
    let prePath = [
        Cesium.Cartesian3.fromDegrees(115.94272, 40.38082, 2000),
        Cesium.Cartesian3.fromDegrees(116.35755, 40.74757, 2000),
    ]

    //自定义渐变材质
    const gradientMaterial = new Cesium.PolylineGlowMaterialProperty({
        color: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.5),
        glowPower: 0.3,
    })
    // 预定轨迹
    let predictPath = viewer.entities.add({
        id: `prePath`,
        name: 'prePath',
        polyline: {
            positions: prePath,
            width: 10,
            material: new Cesium.PolylineGlowMaterialProperty({
                color: Cesium.Color.WHITE.withAlpha(0.2),
                glowPower: 0.1,
            }),
            clampToGround: false
        }
    })
    bottomContainerRef.current.push(predictPath)

    let uavCount = 0


    // 生成起点和终点
    let startPoint = viewer.entities.add({
        name: 'StartPoint',
        position: testStep[0],
        point: {
            pixelSize: 10,
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
        }
    })
    bottomContainerRef.current.push(startPoint)

    let endPoint = viewer.entities.add({
        name: 'EndPoint',
        position: testStep[testStep.length - 1],
        point: {
            pixelSize: 10,
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
        }
    })
    bottomContainerRef.current.push(endPoint)

    // 比例缩放回调函数
    const scaleCallback = (scaleBasic: number) => (new Cesium.CallbackProperty(() => {
        // 获取相机的经度、纬度和高度
        let cameraCartographic = viewer.camera.positionCartographic;
        let cameraCartesian = Cesium.Cartesian3.fromRadians(
            cameraCartographic.longitude,
            cameraCartographic.latitude,
            cameraCartographic.height
        );

        // 获取实体的位置
        let entityPosition = Cesium.Cartographic.fromCartesian(testStep[uavCount]);
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

    // 模拟连续生成可信飞机位置
    const interval = setInterval(() => {

        // 结束模拟
        if (uavCount >= testStep.length - 1) {
            clearInterval(interval);
            return;
        }
        // 清除上一个时间点无人机
        viewer.entities.removeById(`${uavCount - 1}`)
        // 生成无人机实体
        let uavId = `${uavCount}`
        let currentOrientation = generateOrientation(testStep[uavCount], testStep[Math.min(uavCount + 1, testStep.length - 1)])
        let uavCredible = viewer.entities.add({
            id: uavId,
            name: 'UAV',
            position: testStep[uavCount],
            model: {
                uri: new Cesium.CallbackProperty(() => {
                    let currentHeight = viewer.camera.positionCartographic.height
                    if (currentHeight < 100000) {
                        return UAV_MODULE
                    }
                    return AIR_MODULE

                }, false),
                scale: scaleCallback(1000),
            },
            orientation: currentOrientation

        });
        bottomContainerRef.current.push(uavCredible)

        // 生成无人机路径
        let uavDot = viewer.entities.add({
            id: `${uavId}Path`,
            name: 'crediblePath',
            polyline: {
                positions: [testStep[Math.max(uavCount - 1, 0)], testStep[uavCount]],
                width: 20,
                material: gradientMaterial,
                clampToGround: false
            }
        })
        bottomContainerRef.current.push(uavDot)

        uavCount++
    }, 3000)

    // 生成现实路径
    generateCube(prePath[0], prePath[1], 500)

    // 信号塔实体
    for (let i = 0; i < 3; i++) {
        let tower = viewer.entities.add({
            name: 'tower',
            model: {
                uri: '../../../../public/tower.glb',
                scale: scaleCallback(2000)
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