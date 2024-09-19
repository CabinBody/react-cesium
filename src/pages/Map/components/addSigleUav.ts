import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { UAV_MODULE } from './Setting'

const addSigleUav = (
    viewer: Cesium.Viewer,
    bottomContainerRef: any,
    startPointRef: any,
    cityRef: any
) => {
    let demo = 2
    let towerPos = [
        Cesium.Cartesian3.fromDegrees(115.894979, 40.445044, 100),
        Cesium.Cartesian3.fromDegrees(116.127752, 40.520062, 100),
        Cesium.Cartesian3.fromDegrees(116.388209, 40.703046, 100),
    ]
    let CrediblePath = [
        Cesium.Cartesian3.fromDegrees(115.94272, 40.38082, 2000),
        Cesium.Cartesian3.fromDegrees(116.20868, 40.52625, 2000),
        Cesium.Cartesian3.fromDegrees(116.35755, 40.74757, 2000),
    ]
    let FaultyPath = [
        Cesium.Cartesian3.fromDegrees(116.08739, 40.46948, 2000),
        Cesium.Cartesian3.fromDegrees(116.16118, 40.51900, 2000),
        Cesium.Cartesian3.fromDegrees(116.08686, 40.66992, 2000),
    ]
    let FaultyPathTo = [
        Cesium.Cartesian3.fromDegrees(116.08739, 40.46948, 2000),
        Cesium.Cartesian3.fromDegrees(116.16118, 40.51900, 2000),
        Cesium.Cartesian3.fromDegrees(116.35755, 40.74757, 2000),
    ]
    let UnauthorizedPath = [
        Cesium.Cartesian3.fromDegrees(115.97587, 40.52572, 2000),
        Cesium.Cartesian3.fromDegrees(115.80016, 40.50473, 2000),
        Cesium.Cartesian3.fromDegrees(115.98238, 40.36973, 2000),
    ]

    let overpassPath = [
        Cesium.Cartesian3.fromDegrees(115.93419, 40.53387, 2000),
        Cesium.Cartesian3.fromDegrees(116.08086, 40.33899, 2000),
        Cesium.Cartesian3.fromDegrees(116.18817, 40.26109, 2000),
    ]
    let getAwayPath = [
        Cesium.Cartesian3.fromDegrees(115.94272, 40.38082, 2000),
        Cesium.Cartesian3.fromDegrees(116.16785, 40.50441, 2000),
        Cesium.Cartesian3.fromDegrees(116.10586, 40.54102, 2000),
        Cesium.Cartesian3.fromDegrees(116.27091, 40.61874, 2000),
        Cesium.Cartesian3.fromDegrees(116.30232, 40.66605, 2000),
        Cesium.Cartesian3.fromDegrees(116.30232, 40.66605, 0),
    ]


    // 预定轨迹
    if (demo == 1) {
        let areaC: any = null
        let areaY: any = null
        bottomContainerRef.current.forEach((item: any) => {
            if (item.name == '昌平区') {
                areaC = item
                areaC.show = false
                areaC.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
            }
            if (item.name == '延庆区_entity') {
                areaY = item
            }
        })
        startPointRef.current = []
        let crediblePathEntity = viewer.entities.add({
            name: 'crediblePath',
            polyline: {
                positions: CrediblePath,
                width: 20,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(0.5)),
                clampToGround: false
            }
        })
        bottomContainerRef.current.push(crediblePathEntity)

        // 可信飞机动画
        let positionPropertyC = new Cesium.SampledPositionProperty()
        for (let i = 0; i < 3; i++) {
            let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
            positionPropertyC.addSample(time, CrediblePath[i])
        }

        // 可信飞机
        let uavCredible = viewer.entities.add({
            id: 'CredibleUav',
            name: 'UAV',
            position: positionPropertyC,
            model: {
                uri: UAV_MODULE,
                minimumPixelSize: 80,
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.GREEN,
                    dashLength: 30
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 3000 // Show the path behind the entity
            },
            orientation: new Cesium.VelocityOrientationProperty(positionPropertyC),
            label: {
                text: '可信无人机',
                font: '24px Helvetica',
                // fillColor: Cesium.Color.RED,
                fillColor: Cesium.Color.GREEN,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40)
            },
        });
        bottomContainerRef.current.push(uavCredible)
        startPointRef.current.push(['CredibleUav', CrediblePath[0]])



        // 不可信轨迹
        let faultyPathEntity = viewer.entities.add({
            name: 'faultyPath',
            polyline: {
                positions: FaultyPathTo,
                width: 20,
                material: new Cesium.PolylineArrowMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                        if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {

                            return Cesium.Color.GREEN.withAlpha(0.5)
                        } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {

                            return Cesium.Color.BLUE.withAlpha(0.5)
                        } else {
                            return Cesium.Color.BLUE.withAlpha(0.5)
                        }
                    }, false)
                ),
                clampToGround: false
            }
        })
        bottomContainerRef.current.push(faultyPathEntity)
        // 不可信飞机动画
        let positionPropertyF = new Cesium.SampledPositionProperty()
        for (let i = 0; i < 3; i++) {
            let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
            positionPropertyF.addSample(time, FaultyPath[i])
        }
        // 不可信飞机实体
        let uavFaulty = viewer.entities.add({
            id: 'FaultyUav',
            name: 'UAV',
            position: positionPropertyF,
            model: {
                uri: UAV_MODULE,
                minimumPixelSize: 80,
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: new Cesium.CallbackProperty(() => {
                        if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {

                            return Cesium.Color.GREEN
                        } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {

                            return Cesium.Color.RED
                        } else {
                            return Cesium.Color.RED
                        }
                    }, false),
                    dashLength: 30
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 3000 // Show the path behind the entity
            },
            orientation: new Cesium.VelocityOrientationProperty(positionPropertyF),
            label: {
                text: new Cesium.CallbackProperty(() => {
                    if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {
                        return '可信无人机'
                    } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                        return '不可信无人机'
                    } else {
                        return '不可信无人机'
                    }
                }, false),
                font: '24px Helvetica',
                // fillColor: Cesium.Color.RED,
                fillColor: new Cesium.CallbackProperty(() => {
                    if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {
                        return Cesium.Color.GREEN;
                    } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                        return Cesium.Color.BLUE;
                    } else {
                        return Cesium.Color.BLUE;
                    }
                }, false),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40)
            },
        });
        bottomContainerRef.current.push(uavFaulty)
        startPointRef.current.push(['FaultyUav', FaultyPath[0], FaultyPath[1]])

        // 不可信飞机虚报
        let positionPropertyFake = new Cesium.SampledPositionProperty()
        for (let i = 0; i < 3; i++) {
            let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
            positionPropertyFake.addSample(time, FaultyPathTo[i])
        }
        let uavFaultyDull = viewer.entities.add({
            id: 'FaultyUav_fake',
            name: 'UAV',
            position: positionPropertyFake,
            model: {
                uri: UAV_MODULE,
                minimumPixelSize: 80,
            },
            orientation: new Cesium.VelocityOrientationProperty(positionPropertyFake),
            label: {
                text: new Cesium.CallbackProperty(() => {
                    if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {
                        return ''
                    } else {
                        return '虚报无人机'
                    }
                }, false),
                font: '24px Helvetica',
                fillColor: Cesium.Color.BLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40)
            },
        });
        bottomContainerRef.current.push(uavFaultyDull)

        // 连接两个不可信无人机
        let trueAndFalse = viewer.entities.add({
            name: 'signal',
            polyline: new Cesium.PolylineGraphics({
                positions: new Cesium.CallbackProperty(() => {
                    return [
                        uavFaulty.position!.getValue(viewer.clock.currentTime),
                        uavFaultyDull.position!.getValue(viewer.clock.currentTime)
                    ]
                }, false),
                width: 3,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED.withAlpha(0.8),
                    dashLength: 20
                }),

            }),
        })
        bottomContainerRef.current.push(trueAndFalse)

        // startPointRef.current.push(['FaultyUav', FaultyPath[0], FaultyPath[1]])

        // 黑飞实体
        let positionPropertyU = new Cesium.SampledPositionProperty()
        for (let i = 0; i < 3; i++) {
            let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
            positionPropertyU.addSample(time, UnauthorizedPath[i])
        }
        let uavUnauthorized = viewer.entities.add({
            id: 'UnauthorizedUav',
            name: 'UAV',
            position: positionPropertyU,
            model: {
                uri: UAV_MODULE,
                minimumPixelSize: 80,
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED,
                    dashLength: 30
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 3000 // Show the path behind the entity
            },
            orientation: new Cesium.VelocityOrientationProperty(positionPropertyU),
            label: {
                text: '黑飞无人机',
                font: '24px Helvetica',
                fillColor: Cesium.Color.RED,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40)
            },
        });
        bottomContainerRef.current.push(uavUnauthorized)
        startPointRef.current.push(['UnauthorizedUav', UnauthorizedPath[0]])

        // 信号塔实体
        for (let i = 0; i < 3; i++) {
            let tower = viewer.entities.add({
                name: 'tower',
                model: {
                    uri: '../../../../public/tower.glb',
                    minimumPixelSize: 150,
                    scale: 1.0, // 调整模型大小
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

        // 信号线
        bottomContainerRef.current.forEach((item: any) => {
            if (item.name == 'UAV') {

                for (let i = 0; i < 3; i++) {
                    let signal = viewer.entities.add({
                        name: 'signal',
                        polyline: new Cesium.PolylineGraphics({
                            positions: new Cesium.CallbackProperty(() => {
                                return [
                                    towerPos[i],
                                    item.position.getValue(viewer.clock.currentTime)
                                ]
                            }, false),
                            width: new Cesium.CallbackProperty(() => {
                                let distance = Cesium.Cartesian3.distance(towerPos[i], item.position.getValue(viewer.clock.currentTime))
                                if (distance > 20000) {
                                    return 0
                                } else {
                                    return 3
                                }
                            }, false),
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.YELLOW.withAlpha(0.3),
                                dashLength: 20
                            }),

                        }),
                    })
                    bottomContainerRef.current.push(signal)
                }
            }
        })
    }
    if (demo == 2) {
        let areaC: any = null
        let areaY: any = null
        bottomContainerRef.current.forEach((item: any) => {
            if (item.name == '昌平区') {
                areaC = item
                areaC.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
            }
            if (item.name == '延庆区_entity') {
                areaY = item
            }
        })
        if (areaC && areaY) {

            const clock = viewer.clock;
            console.log(areaC, areaY)
            // 监听时间变化事件
            let startTime = viewer.clock.startTime;
            clock.onTick.addEventListener(function (clock) {
                // 获取当前时间
                const currentTime = clock.currentTime;
                if (currentTime.secondsOfDay - startTime.secondsOfDay < 20) {
                    areaC.show = false
                    areaY.show = true
                }
                if (currentTime.secondsOfDay - startTime.secondsOfDay > 20) {
                    areaC.show = true
                    // areaC.polygon.material = Cesium.Color.GRAY
                }

            });

            let crediblePathEntity = viewer.entities.add({
                name: 'crediblePath',
                polyline: {
                    positions: overpassPath,
                    width: 20,
                    material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(1)),
                    clampToGround: false
                }
            })
            bottomContainerRef.current.push(crediblePathEntity)


            // 可信飞机动画
            let positionPropertyC = new Cesium.SampledPositionProperty()
            for (let i = 0; i < 3; i++) {
                let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
                positionPropertyC.addSample(time, overpassPath[i])
            }

            // 可信飞机
            let uavCredible = viewer.entities.add({
                id: 'CredibleUav',
                name: 'UAV',
                position: positionPropertyC,
                model: {
                    uri: UAV_MODULE,
                    minimumPixelSize: 80,
                },
                path: {
                    resolution: 1,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.GREEN,
                        dashLength: 30
                    }),
                    width: 3,
                    leadTime: 0, // Show the path ahead of the entity
                    trailTime: 3000 // Show the path behind the entity
                },
                orientation: new Cesium.VelocityOrientationProperty(positionPropertyC),
                label: {
                    text: new Cesium.CallbackProperty(() => {
                        if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 21&&viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay>20) {
                            cityRef.current = false
                        }
                        if (cityRef.current == true) {
                            return '可信无人机'
                        } else {
                            return '超越管辖范围'
                        }
                    }, false),
                    font: '24px Helvetica',
                    // fillColor: Cesium.Color.RED,
                    fillColor: new Cesium.CallbackProperty(() => {
                        if (cityRef.current == true) {
                            return Cesium.Color.GREEN;
                        } else {
                            return Cesium.Color.GRAY;
                        }
                    }, false),
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 10,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -40)
                },
            });
            bottomContainerRef.current.push(uavCredible)


            // 生成信号塔
            for (let i = 0; i < 3; i++) {
                let tower = viewer.entities.add({
                    name: 'tower',
                    model: {
                        uri: '../../../../public/tower.glb',
                        minimumPixelSize: 150,
                        scale: 1.0, // 调整模型大小
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

            // 信号线
            bottomContainerRef.current.forEach((item: any) => {
                if (item.name == 'UAV') {

                    for (let i = 0; i < 3; i++) {
                        let signal = viewer.entities.add({
                            name: 'signal',
                            polyline: new Cesium.PolylineGraphics({
                                positions: new Cesium.CallbackProperty(() => {
                                    return [
                                        towerPos[i],
                                        item.position.getValue(viewer.clock.currentTime)
                                    ]
                                }, false),
                                width: new Cesium.CallbackProperty(() => {
                                    let distance = Cesium.Cartesian3.distance(towerPos[i], item.position.getValue(viewer.clock.currentTime))
                                    if (distance > 20000) {
                                        return 0
                                    } else {
                                        return 3
                                    }
                                }, false),
                                material: new Cesium.PolylineDashMaterialProperty({
                                    color: Cesium.Color.YELLOW.withAlpha(0.3),
                                    dashLength: 20
                                }),

                            }),
                        })
                        bottomContainerRef.current.push(signal)
                    }
                }
            })
        }

    }
    if (demo == 3) {
        let areaC: any = null
        let areaY: any = null
        bottomContainerRef.current.forEach((item: any) => {
            if (item.name == '昌平区') {
                areaC = item
                areaC.show = false
                areaC.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
            }
            if (item.name == '延庆区_entity') {
                areaY = item
            }
        })
        let crediblePathEntity = viewer.entities.add({
            name: 'crediblePath',
            polyline: {
                positions: CrediblePath,
                width: 20,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(0.5)),
                clampToGround: false
            }
        })
        bottomContainerRef.current.push(crediblePathEntity)

        // 可信飞机动画
        let positionPropertyC = new Cesium.SampledPositionProperty()
        for (let i = 0; i < 6; i++) {
            let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 10, new Cesium.JulianDate())
            positionPropertyC.addSample(time, getAwayPath[i])
        }

        // 可信飞机
        let uavCredible = viewer.entities.add({
            id: 'CredibleUav',
            name: 'UAV',
            position: positionPropertyC,
            model: {
                uri: UAV_MODULE,
                minimumPixelSize: 80,
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: new Cesium.CallbackProperty(() => {
                        if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 10) {

                            return Cesium.Color.GREEN
                        } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 30) {

                            return Cesium.Color.YELLOW
                        } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                            return Cesium.Color.GREEN
                        } else {
                            return Cesium.Color.YELLOW
                        }
                    }, false),
                    dashLength: 30
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 3000 // Show the path behind the entity
            },
            orientation: new Cesium.VelocityOrientationProperty(positionPropertyC),
            label: {
                text: new Cesium.CallbackProperty(() => {
                    if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 10) {

                        return '可信无人机'
                    } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 30) {

                        return '区域遣返，重新规划'
                    } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                        return '可信无人机'
                    } else {
                        return '区域迫降'
                    }
                }, false),
                font: '24px Helvetica',
                // fillColor: Cesium.Color.RED,
                fillColor: new Cesium.CallbackProperty(() => {
                    if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 10) {

                        return Cesium.Color.GREEN
                    } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 30) {

                        return Cesium.Color.YELLOW
                    } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                        return Cesium.Color.GREEN
                    } else {
                        return Cesium.Color.YELLOW
                    }
                }, false),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40)
            },
        });
        bottomContainerRef.current.push(uavCredible)
    }

}

export default addSigleUav