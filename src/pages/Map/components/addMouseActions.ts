import { DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT } from './Setting'
import * as Cesium from "cesium";
import {
    findItemById,
} from './methodsRepo'
import { Mouse } from '../../../global-env';



const addMouseActions = (props:Mouse) => {
    const {
        viewer,
        setLongitude,
        setLatitude,
        setPickUavId,
        setTarget,
        dataPrimitive,
        uavCountList
    } = props


    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(function onLeftClick(click: any) {
        let pickObject = viewer.scene.pick(click.position)

        if (Cesium.defined(pickObject)) {
            // setPickId('')
            // console.log(pickObject)
            if (pickObject.id) {
                if (pickObject.id.name == 'UAV') {
                    // console.log('点击了对象:', pickObject.id);
                    setPickUavId(pickObject.id.id)
                    let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
                    if (foundItem) {
                        setTarget(item => ({
                            ...item,
                            id: foundItem.id,
                            height: foundItem.height,
                            longitude: foundItem.longitude,
                            latitude: foundItem.latitude
                        }))
                    }
                    // console.log(foundItem, 111112323)
                    // console.log(typeof pickObject.id.id, pickObject.id.id, 11111)
                }
                else if (pickObject.id.properties.level._value == 'province') {
                    setPickUavId('')
                    // console.log('点击了对象:', pickObject.id.properties.level._value);
                    setTarget(item => ({
                        ...item, // 保留之前的状态
                        province: pickObject.id.name,
                        id: pickObject.id.id,
                        uavCount: uavCountList[pickObject.id.name]
                    }));

                }
                else {
                    setPickUavId('')
                }
            }
        }
        else {
            setPickUavId('')
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)



    const highlightColor = new Cesium.Color(1.0, 1.0, 1.0, 0.5)
    const defaultColor = Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3)
    let highlightedEntity: any = null;
    // 添加鼠标移动控制镜头移动
    handler.setInputAction(function (movement: any) {
        let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        let pickedObject = viewer.scene.pick(movement.endPosition)
        let percise = 0
        let currentLogi = DEFAULTCAMERALONGITUDE
        let currentAlti = DEFAULTCAMERALATITUDE
        if (cartesian) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            let longitude = Cesium.Math.toDegrees(cartographic.longitude)
            let latitude = Cesium.Math.toDegrees(cartographic.latitude)
            // 相机和鼠标一起动
            setLongitude(longitude)
            setLatitude(latitude)
            let currentHeight = viewer.camera.positionCartographic.height
            if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon
                && currentHeight > 850000) {
                if (highlightedEntity !== pickedObject.id) {
                    if (highlightedEntity) {
                        highlightedEntity.polygon.material = defaultColor
                    }
                    highlightedEntity = pickedObject.id
                    highlightedEntity.polygon.material = highlightColor
                }
            } else if (highlightedEntity) {
                highlightedEntity.polygon.material = defaultColor
                highlightedEntity = null
            }
            percise = Math.abs((currentLogi - longitude + currentAlti - latitude))
            if (longitude < 160 && longitude > 75 && latitude > -5 && latitude < 54 && percise > 2 && currentHeight > 6691711) {
                viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(
                        DEFAULTCAMERALONGITUDE - (DEFAULTCAMERALONGITUDE - longitude) * 0.2,
                        DEFAULTCAMERALATITUDE - (DEFAULTCAMERALATITUDE - latitude) * 0.5,
                        DEFAULTCAMERAHEIGHT
                    ),
                });
                currentAlti = latitude
                currentLogi = longitude
                percise = 0
            }
        }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    // 添加双击事件
    handler.setInputAction((doubleClick:any)=>{
        let pickObject = viewer.scene.pick(doubleClick.position)
        // console.log(pickObject)
        if(Cesium.defined(pickObject)){
            if(pickObject.id.properties.level._value == 'province'){
                
            }
        }

    },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    return handler
}

export default addMouseActions