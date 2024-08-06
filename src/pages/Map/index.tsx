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
import { getDataPrimitive, findItemById } from "./components/methodsRepo"
import uavImg from '../../asset/UAV.png'
import switchUavView from './components/switchUavView';




const CesiumMap: React.FC = () => {
  const [showBackBnt, setShowBackBnt] = useState(false)
  const [selectedOption, setSelectedOption] = useState('');
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
  const viewerRef = useRef<Cesium.Viewer | any>(null)
  const currentRef = useRef<CurrentLocation | any>(null)
  const topContainerRef = useRef<any[]>([])
  const mediumContainerRef = useRef<any[]>([])
  const bottomContainerRef = useRef<any[]>([])

  const [isShowSideBar, setIsShowSideBar] = useState(true)

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
      // baseLayer: new Cesium.ImageryLayer(layer),
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
    viewerRef.current = viewer



    const currentState: CurrentLocation = {
      layer: 'TOP',
      province: '',
      city: ''
    }
    currentRef.current = currentState
    viewerInitial(viewer, topContainerRef)


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
            let dataPrimitive = getDataPrimitive(currentState.province, currentState.city)
            // console.log('点击了对象:', pickObject.id);
            setPickUavId(pickObject.id.id)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            if (foundItem) {
              setTarget(item => ({
                ...item,
                id: foundItem.id,
                height: foundItem.height,
                longitude: foundItem.longitude,
                latitude: foundItem.latitude,
                degree: foundItem.degree,
                pitch: foundItem.pitch,
                roll: foundItem.roll
              }))
            }
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
              setPickUavId('')
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
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon
          && currentState.layer != 'BOTTOM') {
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
          }
        }

        else if (currentState.layer == 'MEDIUM') {
          if (pickObject.id.properties) {
            if (pickObject.id.properties.level._value == 'city' || 'district') {
              currentState.layer = 'BOTTOM'
              setIsShowSideBar(false)
              switchCityView(viewer, currentState.province, currentState.city, bottomContainerRef)
              mediumContainerRef.current.forEach(item => {
                item.show = false
              })
            }
          }
        }
        else if (currentState.layer == 'BOTTOM' || currentState.layer == 'REALITY') {
          if (pickObject.id.name == 'UAV') {
            let dataPrimitive = getDataPrimitive(currentState.province, currentState.city)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            if (foundItem) {
              currentState.layer = 'REALITY'
              viewer.imageryLayers.remove(viewer.imageryLayers.get(1))
              switchUavView(viewer, foundItem)
              // console.log(viewer.imageryLayers.get(1)
              setShowBackBnt(true)
              bottomContainerRef.current.forEach(item => {
                if (item.name != 'UAV') {
                  item.show = false
                }
              })
              setPickUavId('')
              // console.log(bottomContainerRef.current)
            }
          }

        }
      }
      else if (currentState.layer != 'REALITY' && currentState.layer != 'TOP') {
        currentState.layer = 'TOP'
        setIsShowSideBar(true)
        resetAll(viewer, topContainerRef, mediumContainerRef, bottomContainerRef)
      }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)



    // console.log(cesiumContainerRef)
    return () => {
      viewer.destroy()
      setPickUavId('')
      setIsShowSideBar(true)
      setShowBackBnt(false)
    }
  }, [cesiumContainerRef.current])

  const rebackMap = () => {
    setShowBackBnt(false)
    viewerRef.current.entities.removeAll()
    viewerRef.current.dataSources.removeAll()
    mediumContainerRef.current = []
    bottomContainerRef.current = []
    viewerInitial(viewerRef.current, topContainerRef)
    setIsShowSideBar(true)
    currentRef.current.layer = 'TOP'

    topContainerRef.current.forEach((item: any) => {
      item.show = true
    })
    // console.log(currentRef)

  }
  const handleChange = (e: any) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert(`Selected option: ${selectedOption}`);
  };

  return (
    <div className='total_wrap'>
      <div className="container">
        {isShowSideBar && <div className='info_wrap_left'>
          <img className='bupt_logo' src={logo} alt="" />
          <div className="sidebar" style={{ height: '3rem' }}>
            <div className="sidebar-content">
              {/* <button onClick={() => { setIsShowMediumLayer(!isShowMediumLayer) }}>test</button> */}
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
        </div>}
        {isShowSideBar && <div className={`info_wrap_right ${target.province ? 'show' : ''}`}>
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
        </div>}
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
            }}
          >
            <div className='uavInfo_content'>
              <span>Uid: {target.id}</span>
              <span className='uavInfo_title' >
                <span>U3 GO2453</span>
                <img src={uavImg} alt="" />
              </span>
              <span>Dir: 20km-H45°{target.degree!.toFixed(1)}-P30°{target.pitch!.toFixed(1)}-R{target.roll!.toFixed(1)}</span>
              <span>
                <div>Hgt: {target.height!.toFixed(2)}m</div>
                <div>Log: {target.longitude!.toFixed(2)}°</div>
                <div>Lat: {target.latitude!.toFixed(2)}°</div>
              </span>
            </div>
            <div className='uavInfo_control'>
              <span className='uavInfo_title' style={{ fontSize: '30px' }}>控制策略</span>
              <div>
                <form onSubmit={handleSubmit} >
                  <div className='uav_control_form'>
                    <div className='uav_control_input'>
                      <label className={selectedOption === 'PersuasionBack' ? 'checked' : ''}>
                        <input
                          type="radio"
                          name="option"
                          value="PersuasionBack"
                          checked={selectedOption === 'PersuasionBack'}
                          onChange={handleChange}
                        />
                        <span className='radio-text'>劝返</span>
                        <span>Persuasion-Back</span>
                      </label>
                    </div>
                    <div className='uav_control_input'>
                      <label className={selectedOption === 'Forced-Landing' ? 'checked' : ''}>
                        <input
                          type="radio"
                          name="option"
                          value="ForcedLanding"
                          checked={selectedOption === 'ForcedLanding'}
                          onChange={handleChange}
                        />
                        <span className='radio-text'>迫降</span>
                        <span >Forced-Landing</span>
                      </label>
                    </div>
                  </div>
                  <div className='button_wrap'>
                    <button className='uav_control_button' type="submit">Submit</button>
                    <button className='uav_control_button' onClick={() => { setPickUavId('') }}>Cancel</button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        }
        <div className={`home_button_wrap ${showBackBnt ? '' : 'close'}`}>
          <button className='home_button' onClick={() => { rebackMap() }}>返回/BACK</button>
        </div>
        <div className="cesiumContainer" ref={cesiumContainerRef} onClick={handleClick}>
        </div>
      </div>
    </div>

  )
}

export default CesiumMap;

