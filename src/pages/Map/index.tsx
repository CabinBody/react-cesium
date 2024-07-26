import './index.less'
import { DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT } from './components/Setting'
import * as Cesium from "cesium";
import React, { useEffect, useRef, useState } from "react";
import './index.less'
import getCameraParameters from "../../utils/GetCameraParam";
import { Point, PopXY } from '../../global-env';
import viewerInitial from './components/viewerInitial';
import loadResources from './components/loadResources';
import addUavEntity from './components/addUavEntity';
import addProvince from './components/addProvince';
import {
  findItemById,
} from './components/methodsRepo'
import Sidebar from './pages/SiderBar';


const CesiumMap: React.FC = () => {

  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickId, setPickId] = useState('')
  const [target, setTarget] = useState<Point | null>()
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<PopXY | null>(null);

  //点击生成信息框
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPopup({ x: event.clientX, y: event.clientY });
  };


  useEffect(() => {

    // 加载数据
    loadResources().then((data) => {
      console.log('模型加载完毕~~~')
      // 无人机原始数据
      const dataPrimitive = data.dataPrimitive
      // 中国省区市的坐标数据
      const province = data.province
      // 初始化cesium地图组件
      const viewer = viewerInitial(cesiumContainerRef)

      // 添加无人机到地图上
      addUavEntity(viewer, dataPrimitive)

      // 添加各省的名称
      addProvince(viewer, province)


      // 添加点击事件
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function onLeftClick(event: any) {
        let pickObject = viewer.scene.pick(event.position)

        if (Cesium.defined(pickObject)) {
          if (pickObject.id.name == 'UAV') {
            console.log('点击了对象:', pickObject.id);
            setPickId(pickObject.id.id)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            setTarget(foundItem)
            console.log(foundItem, 111112323)
            console.log(typeof pickObject.id.id, pickObject.id.id, 11111)
            getCameraParameters(viewer)
          }
          else {
            setPickId('')
          }
        }
        else {
          setPickId('')
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
              // duration: 1, // 飞行的持续时间（秒）
              // pitchAdjustHeight: -10000, // 调整俯仰角度时的高度（可选）
              // endTransform: Cesium.Matrix4.IDENTITY, // 最终的变换矩阵（可选）
              // maximumHeight: DEFAULTCAMERAHEIGHT, // 飞行过程中的最大高度（可选）
              // easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT // 缓动函数（可选）
            });
            currentAlti = latitude
            currentLogi = longitude
            percise = 0
          }
        }

      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



      return () => {
        viewer.destroy()
        setPickId('')
      }
    })
  }, [])


  return (
    <div className="container">
      <div className='info_wrap_left'>
        <Sidebar content='xxxxx'></Sidebar>
      </div>
      <div className='info_wrap_right'>
        <Sidebar content='asdasd'></Sidebar>
      </div>
      <div className="hide"></div>
      <div className="coordinate">Longitude: {longitude_ALL} Latitude:{latitude_ALL}</div>
      {pickId && popup &&
        <div
          className='pop'
          style={{
            position: 'absolute',
            top: popup.y,
            left: popup.x,
            backgroundColor: 'white',
            border: '1px solid black',
            padding: '10px',
          }}
        >
          Id: {target?.id} <br />
          Height: {target?.height} <br />
          Longitude: {target?.longitude} <br />
          Latitude: {target?.latitude} <br />

        </div>
      }
      <div className="cesiumContainer" ref={cesiumContainerRef} onClick={handleClick}>
      </div>

    </div>
  )
}

export default CesiumMap;

