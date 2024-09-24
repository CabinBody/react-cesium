import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { getDataPrimitive } from './methodsRepo'
import { UAV_MODULE } from './Setting'

const alarmType = ['Unauthorized', 'Faulty', 'Credible']

const addUavEntity = (
    viewer: Cesium.Viewer,
    bottomContainerRef: any,
    province: string,
    city: string
) => {
    //添加默认的无人机实体
    const dataPrimitive = getDataPrimitive(province, city)
    function randomNumber(item: number): number {
        let sign = Math.random() >= 0.5 ? 1 : -1; // 随机生成一个正负号
        let randomNumber = Math.random() / 5; // 生成一个0到max之间的随机整数
        return item + (sign * randomNumber) // 返回正负数
    }

    if (dataPrimitive.cartesianPointList) {
        let towerCount = 0
        for (let index = 0; index < dataPrimitive.cartesianPointList.length && index < 50; index++) {
            let position = dataPrimitive.cartesianPointList[index]
            if (dataPrimitive.hprList) {

                // 预定轨迹
                let cartoPos = Cesium.Cartographic.fromCartesian(position)
                let lo = Cesium.Math.toDegrees(cartoPos.longitude)
                let la = Cesium.Math.toDegrees(cartoPos.latitude)
                let ht = cartoPos.height

                let randomLaLo = [[lo, la, ht]]
                for (let i = 0; i < 2; i++) {
                    randomLaLo.push([randomNumber(randomLaLo[i][0]), randomNumber(randomLaLo[i][1]), ht])
                }
                let pathPositions = [
                    Cesium.Cartesian3.fromDegrees(lo, la, ht),
                    Cesium.Cartesian3.fromDegrees(randomLaLo[1][0], randomLaLo[1][1], ht),
                    Cesium.Cartesian3.fromDegrees(randomLaLo[2][0], randomLaLo[2][1], ht),
                ]

                let wrongPath = [
                    Cesium.Cartesian3.fromDegrees(lo, la, ht),
                    pathPositions[1],
                    Cesium.Cartesian3.fromDegrees(randomNumber(lo), randomNumber(la), ht),
                ]
                let positionProperty = new Cesium.SampledPositionProperty()
                // 实际轨迹
                // 可信飞机
                if (alarmType[index % 3] == 'Credible') {
                    for (let i = 0; i < 3; i++) {
                        let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
                        positionProperty.addSample(time, pathPositions[i])
                    }
                    let path = viewer.entities.add({
                        name: 'crediblePath',
                        polyline: {
                            positions: pathPositions,
                            width: 10,
                            material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(1)),
                            clampToGround: false
                        }
                    })
                    bottomContainerRef.current.push(path)

                }
                // 不可信飞机
                if (alarmType[index % 3] == 'Faulty') {
                    for (let i = 0; i < 3; i++) {
                        let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
                        positionProperty.addSample(time, wrongPath[i])
                    }
                    let path = viewer.entities.add({
                        name: 'crediblePath',
                        polyline: {
                            positions: pathPositions,
                            width: 10,
                            material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN.withAlpha(1)),
                            clampToGround: false
                        }
                    })
                    bottomContainerRef.current.push(path)
                }
                // 黑飞
                if (alarmType[index % 3] == 'Unauthorized') {
                    for (let i = 0; i < 3; i++) {
                        let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
                        positionProperty.addSample(time, pathPositions[i])
                    }
                }


                // 添加无人机实体
                let UAVRadius = 1000
                let uav = viewer.entities.add({
                    id: dataPrimitive.origin[index].id,
                    name: 'UAV',
                    position: positionProperty,
                    model: {
                        uri: UAV_MODULE,
                        minimumPixelSize: 80,
                    },
                    path: {
                        resolution: 1,
                        material: new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED.withAlpha(0.5),
                            dashLength: 30
                        }),
                        width: 3,
                        leadTime: 0, // Show the path ahead of the entity
                        trailTime: 3000 // Show the path behind the entity
                    },
                    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
                    label: {
                        text: new Cesium.CallbackProperty(() => {
                            if (index % 3 == 1) {
                                if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {
                                    return alarmType[2]
                                } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                                    return alarmType[1]
                                } else {
                                    return alarmType[1]
                                }
                            }
                            else return alarmType[index % 3]
                        }, false),
                        font: '24px Helvetica',
                        // fillColor: Cesium.Color.RED,
                        fillColor: new Cesium.CallbackProperty(() => {
                            if (index % 3 == 0) {
                                return Cesium.Color.RED
                            }
                            if (index % 3 == 1) {
                                if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 20) {
                                    return Cesium.Color.GREEN;
                                } else if (viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay < 40) {
                                    return Cesium.Color.BLUE;
                                } else {
                                    return Cesium.Color.BLUE;
                                }
                            }
                            if (index % 3 == 2) {
                                return Cesium.Color.GREEN
                            }
                        }, false),
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 10,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -40)
                    },
                    // ellipse: new Cesium.EllipseGraphics({
                    //     semiMajorAxis: UAVRadius,
                    //     semiMinorAxis: UAVRadius,
                    //     material: Cesium.Color.ORANGE.withAlpha(0.1),
                    //     height: 2000
                    // })
                });
                bottomContainerRef.current.push(uav)


                // 添加信号塔  最大数量为10
                if (towerCount < 10) {
                    let tower = viewer.entities.add({
                        name: 'tower',
                        model: {
                            uri: '../../../../public/tower.glb',
                            minimumPixelSize: 200,
                            scale: 1.0, // 调整模型大小
                        },
                        position: Cesium.Cartesian3.fromDegrees(lo + 0.04, la - 0.04, 100),
                    })
                    bottomContainerRef.current.push(tower)
                }
            }
        }

        // 添加信号塔和无人机之间信号
        let signalCount = 0
        let towerPosition = [] as any[]
        bottomContainerRef.current.forEach((item: any) => {
            if (item.name == 'tower') {
                towerPosition.push(item.position.getValue(viewer.clock.currentTime))
            }
        })
        bottomContainerRef.current.forEach((item: any) => {
            if (signalCount < 20) {
                if (item.name == 'UAV') {
                    towerPosition.forEach((towerPos: any) => {
                        let signal = viewer.entities.add({
                            name: 'signal',
                            polyline: new Cesium.PolylineGraphics({
                                positions: new Cesium.CallbackProperty(() => {
                                    return [
                                        towerPos,
                                        item.position.getValue(viewer.clock.currentTime)
                                    ]
                                }, false),
                                width: 2,
                                material: new Cesium.PolylineDashMaterialProperty({
                                    color: Cesium.Color.YELLOW.withAlpha(0.3),
                                    dashLength: 20
                                }),
                                
                            }),
                        })
                        bottomContainerRef.current.push(signal)
                        signalCount += 1
                    })
                }
            }

        })

    }
}

export default addUavEntity