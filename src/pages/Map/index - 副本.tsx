import './index.less'
import React, { useEffect, useRef, useState } from "react";
import './index.less'
import * as Cesium from 'cesium'
import { DataPoint, Point, PopXY } from '../../global-env';
import viewerInitial from './components/viewerInitial';
import loadResources from './components/loadResources';
import addMouseActions from './components/addMouseActions';
import logo from '../../asset/buptLogo.png'
import { Col, Row, Statistic, ConfigProvider, Empty } from 'antd';
import CurrentTime from './components/currentTime'
import BarChart from './dataView/BarChart';
import DensityMap from './dataView/DensityMap';




const CesiumMap: React.FC = () => {
  // const dispatch: RootDispatch = useDispatch()
  const [test,setTest] = useState(true)
  const [height_ALL, setheight] = useState(0)
  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickUavId, setPickUavId] = useState('')
  const [target, setTarget] = useState<Point>({
    province: '北京市',
    city:'',
    id: 0,
    longitude: 0,
    latitude: 0,
    height: 0,
    degree: 0,
    pitch: 0,
    roll: 0,
    uavCount: 0
  })
  const cesiumContainerRef = useRef<HTMLDivElement|any>(null)
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

   
    // 初始化Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        
        // terrain: Cesium.Terrain.fromWorldTerrain(),
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


    viewerInitial(viewer)

    const dataPrimitive = [] as any[]

    // 添加点击事件

    addMouseActions({
      viewer,setLongitude, setLatitude,
      setPickUavId, setTarget, setheight, dataPrimitive,
      uavCountList,
    })

    return () => {
      // viewer.destroy()
      setPickUavId('')
    }
  }, [test])


  return (
    <div className='total_wrap'>
      <div className="container">
        <div className='info_wrap_left'>
          <img className='bupt_logo' src={logo} alt="" />
          <div className="sidebar" style={{ height: '100px' }}>
            <div className="sidebar-content">
            <button onClick={() => {setTest(!test)}}></button>
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
        {test && <div className="cesiumContainer" ref={cesiumContainerRef} onClick={handleClick}>
        </div>}
      </div>
    </div>

  )
}

export default CesiumMap;

