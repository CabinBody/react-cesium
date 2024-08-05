import './index.less'
import React, { useEffect, useRef, useState } from "react";
import './index.less'
import * as Cesium from 'cesium'
import { DataPoint, Point, PopXY } from '../../global-env';
import viewerInitial from './components/viewerInitial';
import loadResources from './components/loadResources';
import logo from '../../asset/buptLogo.png'
import { Col, Row, Statistic, ConfigProvider, Empty } from 'antd';
import CurrentTime from './components/currentTime'
import BarChart from './dataView/BarChart';
import DensityMap from './dataView/DensityMap';
import { CESIUMTOKEN } from './components/Setting';
import switchProvinceView from './components/switchProvinceView';
import resetAll from './components/resetAll';
import switchCityView from './components/switchCityView';




const CesiumMap: React.FC = () => {
  // const dispatch: RootDispatch = useDispatch()
  const [height_ALL, setheight] = useState(0)
  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickUavId, setPickUavId] = useState('')
  const [target, setTarget] = useState<Point>({
    province: '北京市',
    city: '',
    id: 0,
    longitude: 0,
    latitude: 0,
    height: 0,
    degree: 0,
    pitch: 0,
    roll: 0,
    uavCount: 0
  })

  const cesiumContainerRef = useRef<Cesium.Viewer | any>(null)
  const topContainerRef = useRef<any[]>([])
  const mediumContainerRef = useRef<any[]>([])
  const bottomContainerRef = useRef<any[]>([])

  const [isShowMediumLayer, setIsShowMediumLayer] = useState(false)

  const [popup, setPopup] = useState<PopXY | null>(null);

  //点击生成信息框
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPopup({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {

    // 加载数据
    const data = loadResources()

    // 初始化cesium地图组件
    const uavCountList: DataPoint[] = data.uavCountList

    Cesium.Ion.defaultAccessToken = CESIUMTOKEN
    // 初始化Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {

      // 禁用infoBox
      infoBox: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      vrButton: false,
    });

    viewerInitial(viewer, topContainerRef)
    const currentState: CurrentLocation = {
      layer: 'TOP',
      province: '',
      city: ''
    }





    // 添加点击事件
    // 单击事件设置
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(function onLeftClick(click: any) {
      let pickObject = viewer.scene.pick(click.position)
      let position = new Cesium.Cartesian2(click.clientX, click.clientY);
      let cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);

      if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        let longitude = Cesium.Math.toDegrees(cartographic.longitude)
        let latitude = Cesium.Math.toDegrees(cartographic.latitude)
        // 相机和鼠标一起动
        setLongitude(longitude)
        setLatitude(latitude)
        let currentHeight = viewer.camera.positionCartographic.height
        setheight(currentHeight)
      }
      if (Cesium.defined(pickObject)) {
        // setPickId('')

        if (pickObject.id) {
          // console.log('点击了对象:', pickObject.id);
          if (pickObject.id.name == 'UAV') {
            // console.log('点击了对象:', pickObject.id);
            setPickUavId(pickObject.id.id)
            // let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            // if (foundItem) {
            //     setTarget(item => ({
            //         ...item,
            //         id: foundItem.id,
            //         height: foundItem.height,
            //         longitude: foundItem.longitude,
            //         latitude: foundItem.latitude
            //     }))
            // }
          }
          else if (pickObject.id.properties) {
            let entityType = pickObject.id.properties.level._value
            if (entityType == 'province') {
              setPickUavId('')
              // console.log('点击了对象:', pickObject.id.properties.level._value);
              let count = uavCountList.find(item => item.name == pickObject.id.name)
              currentState.province = pickObject.id.name
              if (count) {
                setTarget(item => ({
                  ...item, // 保留之前的状态
                  province: pickObject.id.name,
                  id: pickObject.id.id,
                  uavCount: count.value
                }))
              }
              else {
                setTarget(item => ({
                  ...item, // 保留之前的状态
                  province: pickObject.id.name,
                  id: pickObject.id.id,
                  uavCount: 0
                }))
              }
            }
            if (entityType == 'city' || entityType == 'district') {
              currentState.city = pickObject.id.name
              let count: any
              let target = uavCountList.find(item => item.name == currentState.province)?.cityList
              if (target) {
                count = target.find(item => item.city_name == pickObject.id.name).city_count
              }
              setTarget(item => ({
                ...item, // 保留之前的状态
                city: pickObject.id.name,
                id: pickObject.id.id,
                uavCount: count
              }));
            }
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


    //移动鼠标事件设置
    const highlightColor = new Cesium.Color(1.0, 1.0, 1.0, 0.5)
    const defaultColor = Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3)
    let highlightedEntity: any = null;
    // 添加高亮
    handler.setInputAction(function (movement: any) {
      let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      let pickedObject = viewer.scene.pick(movement.endPosition)
      // console.log(pickedObject)
      if (cartesian) {
        let currentHeight = viewer.camera.positionCartographic.height
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon
          && currentHeight > 50000) {
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
      }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    // 添加双击事件
    handler.setInputAction((doubleClick: any) => {
      let pickObject = viewer.scene.pick(doubleClick.position)

      // console.log(pickObject)
      if (Cesium.defined(pickObject)) {
        if (currentState.layer == 'TOP') {
          if (pickObject.id.properties.level._value == 'province') {
            topContainerRef.current.forEach(item => {
              item.show = false
            })
            currentState.layer = 'MEDIUM'
            mediumContainerRef.current.splice(0, mediumContainerRef.current.length)
            switchProvinceView(viewer, pickObject.id.name, mediumContainerRef)
            setIsShowMediumLayer(true)
          }
        }

        else if (currentState.layer == 'MEDIUM') {
          if (pickObject.id.properties) {
            if (pickObject.id.properties.level._value == 'city' || 'district') {
              switchCityView(viewer, currentState.province, currentState.city)
            }
          }
        }

      }
      else {
        currentState.layer = 'TOP'
        resetAll(viewer, topContainerRef, mediumContainerRef)
      }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)




    return () => {
      viewer.destroy()
      setPickUavId('')
    }
  }, [])

  useEffect(() => {
    mediumContainerRef.current.forEach(entity => {
      if (entity.name) {
      }
      entity.show = isShowMediumLayer
    })
  }, [isShowMediumLayer])


  return (
    <div className='total_wrap'>
      <div className="container">
        <div className='info_wrap_left'>
          <img className='bupt_logo' src={logo} alt="" />
          <div className="sidebar" style={{ height: '3rem' }}>
            <div className="sidebar-content">
              <button onClick={() => { setIsShowMediumLayer(!isShowMediumLayer) }}>11111111</button>
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
                <Row gutter={11} >
                  <Col span={12} >
                    <Statistic title='无人机总数量' value={20000} />
                  </Col>
                  <Col span={12}>
                    <Statistic title='运行中无人机' value={18000} />
                  </Col>
                  <Col span={12}>
                    <Statistic title='当前选取地区无人机数量' value={target.uavCount} />
                  </Col>
                  <Col span={12}>
                    <Statistic title='当前选取地区运行中无人机' value={`${target.uavCount ? ~~(target.uavCount! / 2) : 0}`} />
                  </Col>
                </Row>
              </ConfigProvider>
              <div className='barChart' style={{ marginTop: '4rem' }}>
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
            <div className="sidebar-content">
              市（区）无人机分布情况：
              <button className='clearButton' onClick={() => { setTarget(item => ({ ...item, province: '' })) }}>
                <img src="../../asset/close.png" alt="" />
              </button>
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar-content">
              <div className='DensityChart'>
                {target.province && <DensityMap province={target.province}></DensityMap>}
              </div>
            </div>
          </div>
        </div>
        <div className="hide">
          <div className="coordinate">Longitude: {longitude_ALL}° &nbsp;&nbsp;&nbsp; Latitude:{latitude_ALL}°
            &nbsp;&nbsp;&nbsp;Height: {height_ALL} m
          </div>
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

