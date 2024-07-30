import './index.less'
import { DEFAULTCAMERALONGITUDE, DEFAULTCAMERALATITUDE, DEFAULTCAMERAHEIGHT } from './components/Setting'
import * as Cesium from "cesium";
import React, { useEffect, useRef, useState } from "react";
import './index.less'
import { Point, PopXY } from '../../global-env';
import viewerInitial from './components/viewerInitial';
import loadResources from './components/loadResources';
import addUavEntity from './components/addUavEntity';
import addProvince from './components/addProvince';
import {
  findItemById,
} from './components/methodsRepo'
import logo from '../../asset/buptLogo.png'
import { Col, Row, Statistic, ConfigProvider, Empty } from 'antd';
import CurrentTime from './components/currentTime'
import BarChart from './dataView/BarChart';
import DensityMap from './dataView/DensityMap';



const CesiumMap: React.FC = () => {

  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickUavId, setPickUavId] = useState('')
  const [target, setTarget] = useState<Point>({
    province: '',
    id: 0,
    longitude: 0,
    latitude: 0,
    height: 0,
    degree: 0,
    pitch: 0,
    roll: 0,
    uavCount: 0
  })
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<PopXY | null>(null);

  //点击生成信息框
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPopup({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    // 加载数据
    const data = loadResources()

    console.log('模型加载完毕~~~')
    // 无人机原始数据
    const dataPrimitive = data.dataPrimitive
    // 中国省区市的坐标数据
    const province = data.province
    // 初始化cesium地图组件
    const uavCountList: any = data.uavCountList

    const viewer = viewerInitial(cesiumContainerRef)



    // 添加无人机到地图上
    // addUavEntity(viewer, dataPrimitive)

    // 添加各省的名称
    addProvince(viewer, province)
    // console.log(uavCountList)

    // 添加点击事件

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(function onLeftClick(event: any) {
      let pickObject = viewer.scene.pick(event.position)

      if (Cesium.defined(pickObject)) {
        // setPickId('')
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
      setPickUavId('')
    }
  }, [])


  return (
    <div className='total_wrap'>
      <div className="container">
        <div className='info_wrap_left'>
          <img className='bupt_logo' src={logo} alt="" />
          <div className="sidebar" style={{ height: '100px' }}>
            <div className="sidebar-content">
              选取省份：{target?.province ? target.province : ''}
              {target.province && <button className='clearButton' onClick={() => { setTarget(item => ({ ...item, province: '' })) }}>
                <img src="../../asset/close.png" alt="" />
              </button>}
            </div>
          </div>
          <div className="sidebar">
            {!target.province && <Empty description=' '></Empty>}
            {target.province && <div className="sidebar-content" style={{ color: 'white' }}>
              <ConfigProvider
                theme={{
                  token: {
                    colorTextBase: 'white',
                    // colorTextSecondary: 'white'
                  },
                }}
              >
                <Row gutter={1} >
                  <Col span={12} >
                    <Statistic title='无人机总数量' value={10000} />
                  </Col>
                  <Col span={12}>
                    <Statistic title='运行中无人机' value={9000} />
                  </Col>
                  <Col span={12}>
                    <Statistic title='当前省份无人机数量' value={target.uavCount} />
                  </Col>
                  <Col span={12}>
                    <Statistic title='当前省份运行中无人机' value={`${target.uavCount ? ~~(target.uavCount! / 2) : 0}`} />
                  </Col>
                </Row>
              </ConfigProvider>
              <div className='barChart'>
                <BarChart></BarChart>
              </div>
            </div>}
          </div>
          <div className="sidebar" style={{ position: 'relative', paddingBottom: '20px', height: '100px' }}>
            <div className="sidebar-content" style={{ flexDirection: 'row' }}>
              当前时间: &nbsp; <CurrentTime></CurrentTime>
            </div>
          </div>
        </div>
        <div className={`info_wrap_right ${target.province ? 'show' : ''}`}>
          <div className="sidebar" style={{ height: '100px' }}>
            <div className="sidebar-content" >
              市（区）无人机分布情况：
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar-content">
              <div className='DensityChart'>
                {target.province&&<DensityMap  province = {String(target.province)}></DensityMap>}
              </div>
            </div>
          </div>
        </div>
        <div className="hide">
          <div className="coordinate">Longitude: {longitude_ALL}° &nbsp;&nbsp;&nbsp; Latitude:{latitude_ALL}°</div>
        </div>
        {pickUavId && popup &&
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
    </div>

  )
}

export default CesiumMap;

