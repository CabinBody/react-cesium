import './index.less'
import React, { useEffect, useRef, useState } from "react";
import './index.less'
import { Point, PopXY } from '../../global-env';
import viewerInitial from './components/viewerInitial';
import loadResources from './components/loadResources';
import addProvince from './components/addProvince';
import addMouseActions from './components/addMouseActions';
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
    province: '北京市',
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

    // 添加点击事件

    addMouseActions({viewer,setLongitude,setLatitude,setPickUavId,setTarget,dataPrimitive,uavCountList})

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

