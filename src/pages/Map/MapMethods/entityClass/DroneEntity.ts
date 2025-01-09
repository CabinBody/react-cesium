import * as Cesium from 'cesium'
import { UAV_MODULE } from '../setting.ts'
import { message } from "antd";

type DroneInfo = {
    uid: string,
    droneType: string,
    companyBelong?: string,
    departureFrom?: string,
    departureTo?: string,
    durationTime?: number,
    distance?: number,
    battery?: number,
    payloadWeight?: number,
    payloadType?: string,
}

type ConstructorOptions = {
    id: number,
    position: [number, number],
    height: number,
    orientation: [number, number, number],
    speed: number,
    info?: DroneInfo,
    model?: string,
}

export class DroneEntity {

    /* 在系统中渲染一个无人机的流程
    1. 初始化无人机的位置、高度、航向角度、速度
    2. 调用无人机的创建方法
    
    */


    /*  
    position: 无人机的位置坐标，格式为[经度,纬度]
    height: 无人机的高度
    orientation: 无人机的航向角度，格式为[heading,pitch,roll]
    speed: 无人机的速度
    info: 无人机的其他信息，格式为Type DroneInfo
    viewer: 绑定所属的cesium地图实例
    */
    id: number
    position: [number, number]
    cartesianPosition: Cesium.Cartesian3
    height: number
    orientation: [number, number, number]
    speed?: number
    info?: DroneInfo
    viewer: Cesium.Viewer
    entityRef?: Cesium.Entity
    model: string = UAV_MODULE


    /* 
    构造函数
    
    初始化无人机的位置、高度、航向角度、速度、其他信息、所属的cesium地图实例
    */
    constructor(viewer: Cesium.Viewer, options: ConstructorOptions) {
        this.id = options.id
        this.position = options.position
        this.height = options.height
        this.orientation = options.orientation
        this.speed = options.speed || 0
        this.viewer = viewer
        this.model = options.model || UAV_MODULE
        this.cartesianPosition = Cesium.Cartesian3.fromDegrees(this.position[0], this.position[1], this.height)
    }




    // 无人机初始化, 调用cesium的实体创建方法, 显示到地图上
    create() {
        this.entityRef = this.viewer.entities.add({
            id: `UAV${this.id}`,
            name: 'drone',
            position: this.cartesianPosition,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(this.cartesianPosition, Cesium.HeadingPitchRoll.fromDegrees(this.orientation[0], this.orientation[1], this.orientation[2])),
            model: {
                uri: this.model,
                scale: this._scaleCallbackByPosition(600, this.cartesianPosition)
            },
            label: {
                text: `UAV${this.id}`,
                font: '16px Helvetica',
                scale: this._scaleCallbackByPosition(3, this.cartesianPosition),
                outlineWidth: 2,
                outlineColor: Cesium.Color.fromCssColorString('#871212').withAlpha(0.5),
                fillColor: Cesium.Color.WHITE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -20)
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
        message.success('无人机已创建')
    }

    // 设置目的地
    setDestinations(pathPoints: number[]) {
        if (!this.entityRef) return

    }

    // 设置无人机的其他信息
    setInfo(info: DroneInfo) {
        this.info = info
    }


    destroy() {
        if (!this.entityRef) return
        this.viewer.entities.remove(this.entityRef)
        message.success('无人机已销毁')
    }

    private _scaleCallbackByPosition(scaleBasic: number, uavPos: Cesium.Cartesian3): Cesium.CallbackProperty {
        return (new Cesium.CallbackProperty(() => {
            // 获取相机的经度、纬度和高度
            let cameraCartographic = this.viewer.camera.positionCartographic;
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
}