import './index.less'
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { DataPoint, Point, PopXY, ConfinedArea } from '../../global-env';
import viewerInitial from './MapMethods/viewerInitial';
import loadResources from './MapMethods/loadResources';
import { CESIUMTOKEN, DEFAULTCAMERAHEIGHT, DEFAULTCAMERALATITUDE, DEFAULTCAMERALONGITUDE, MAPBOX_USER, TIDITU_TOKEN } from './MapMethods/setting';
import switchProvinceView from './MapMethods/switchProvinceView';
import resetCesium from './MapMethods/resetCesium';
import switchCityView from './MapMethods/switchCityView';
import { getDataPrimitive, findItemById } from "./MapMethods/methodsRepo"
import PickedInfo from './components/PickedInfo';
import confineImg from '../../asset/confine.png'
import switchUavView from './MapMethods/switchUavView';
import SubmitSuccess from './MapMethods/SubmitSuccess';
import Navigator from './Navigator';
import AirspaceManagement from './AirspaceManagement';
import FlightRouteStatistics from './FlightRouteStatistics';
import HomePage from './HomePage';
import RegionalSituation from './RegionalSituation';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootState } from '../../store'
import { setPage } from '../../store/modules/pageSwitchReducer';
import { setEntityCity, setEntityInfo, setEntityProvince } from '../../store/modules/leftClickTargetReducer';

export const useLayerRef = () => {
  const topContainerRef = useRef<any[]>([])
  const mediumContainerRef = useRef<any[]>([])
  const bottomContainerRef = useRef<any[]>([])

  return {
    topContainerRef,
    mediumContainerRef,
    bottomContainerRef
  }
}

const CesiumMap: React.FC = () => {
  const dispatch: RootDispatch = useDispatch()
  const { entityInfo, _city, _province } = useSelector((state: RootState) => state.onLeftClickTarget)
  const [controlSignal, setControlSignal] = useState('')
  const [onDraw, setOnDraw] = useState(true)
  const [isShowButton, setIsShowButton] = useState(false)
  const [isShowComponent, setIsShowComponent] = useState(false)
  const [selectedOption, setSelectedOption] = useState('');
  const [cameraHeight, setCameraHeight] = useState(0)
  const [height_ALL, setheight] = useState('')
  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickUavId, setPickUavId] = useState('')
  const targetRef = useRef<any>([])
  const signalRef = useRef<any>(null)

  const { pageName } = useSelector((state: RootState) => state.pageSwitch)

  const confinedAreaWrapRef = useRef<ConfinedArea[] | null>(null)
  const targetAreaRef = useRef<ConfinedArea | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  const cesiumContainerRef = useRef<Cesium.Viewer | any>(null)
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null)
  const viewerRef = useRef<Cesium.Viewer | any>(null)
  const currentRef = useRef<CurrentLocation>({
    layer: 'TOP',
    province: '',
    city: '',
    cameraHeight: DEFAULTCAMERAHEIGHT,
    cameraLongitude: DEFAULTCAMERALONGITUDE,
    cameraLatitude: DEFAULTCAMERALATITUDE,
    cameraHeading: 0,
    cameraPitch: -90,
    cameraRoll: 0,
  })

  const { topContainerRef, mediumContainerRef, bottomContainerRef } = useLayerRef()



  const cityRef = useRef<any>(true)

  const drawModeRef = useRef<any>(null)
  const drawWrapRef = useRef<any>(null)
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [isPaused, setIsPaused] = useState(true)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [popup, setPopup] = useState<PopXY | null>(null);
  const [rPopup, setRpopup] = useState<PopXY | null>(null);
  const [isClickArea, setIsClickArea] = useState(false)

  //左键点击生成信息框
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPopup({ x: event.clientX, y: event.clientY });
  }
  //右键点击生成信息框
  const rightHandleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault()
    setRpopup({ x: event.clientX, y: event.clientY });
    // console.log(event.clientX, event.clientY)
  }

  // 地图主体
  useEffect(() => {
    // 加载数据
    const data = loadResources()

    // 初始化cesium地图组件
    const uavCountList: DataPoint[] = data.uavCountList

    Cesium.Ion.defaultAccessToken = CESIUMTOKEN

    // 影像层选取
    const imageryProviders = [
      new Cesium.ImageryLayer(new Cesium.MapboxStyleImageryProvider({
        username: MAPBOX_USER.username,
        styleId: 'clzi16g9c00h501pr4mtt3owf',
        accessToken: MAPBOX_USER.token,
      })),
      // new Cesium.ImageryLayer.fromWorldImagery(),,
      Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(2), {})
    ]

    // 初始化Cesium Viewer
    viewerRef.current = new Cesium.Viewer(cesiumContainerRef.current, {
      baseLayer: imageryProviders[1],
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

    const viewer: Cesium.Viewer = viewerRef.current

    setViewer(viewer)

    viewer.imageryLayers.add(imageryProviders[0])
    drawWrapRef.current = []




    let activeShapePoints = [] as any[]
    let activeShape: any = null
    let floatingPoint: any = null


    viewerInitial(viewer, topContainerRef)



    // 添加左键点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(function onLeftClick(click: any) {
      resetLeftClick()
      let pickObject = viewer.scene.pick(click.position)
      let pickedPosition = viewer.scene.pickPosition(click.position)
      setRpopup(null)
      // 绘画限制区域后的左键点击事件
      if (drawModeRef.current == 'polygon' || drawModeRef.current == 'circle' || drawModeRef.current == 'rectangle') {
        if (Cesium.defined(pickedPosition)) {
          if (activeShapePoints.length == 0) {
            floatingPoint = drawPoint(pickedPosition)
            activeShapePoints.push(pickedPosition)
            let dynamicPositions = new Cesium.CallbackProperty(() => {
              if (drawModeRef.current === 'polygon') {
                return new Cesium.PolygonHierarchy(activeShapePoints)
              }
              return activeShapePoints
            }, false)
            activeShape = drawShape(dynamicPositions)
          }
          activeShapePoints.push(pickedPosition)
          drawPoint(pickedPosition)
        }
      }
      // 左键单击查看当前位置和相机位置信息
      if (pickedPosition) {
        let cartographic = Cesium.Cartographic.fromCartesian(pickedPosition)
        let longitude = Cesium.Math.toDegrees(cartographic.longitude)
        let latitude = Cesium.Math.toDegrees(cartographic.latitude)
        let height = cartographic.height.toFixed(2)
        let cHeight = viewer.camera.positionCartographic.height
        setLongitude(longitude)
        setLatitude(latitude)
        setheight(height)
        setCameraHeight(cHeight)
      }

      // Cesium地图内的实体左键点击事件
      if (Cesium.defined(pickObject)) {
        // demo演示添加的点击事件
        console.log('点击了对象:', pickObject.id)
        if (pickObject.id) {
          // if (pickObject.id.name == '昌平区') {
          //   cityRef.current = true
          //   bottomContainerRef.current.forEach(item => {
          //     if (item.name == '延庆区_entity') {
          //       item.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
          //     }
          //     if (item.name == '昌平区') {
          //       item.polygon.material = Cesium.Color.fromCssColorString('#00868B').withAlpha(0.1)
          //     }
          //   })
          //   setPickUavId('')
          //   setSelectedOption('')
          //   setIsClickArea(false)
          //   setIsConfigured(false)
          //   targetAreaRef.current = null
          // }
          if (pickObject.id.name == 'tower') {
            // console.log('点击了对象:', pickObject.id.ellipse)
            if (pickObject.id.ellipse.show == true) {
              pickObject.id.ellipse.show = false
            }
            else {
              pickObject.id.ellipse = new Cesium.EllipseGraphics({
                show: true,
                semiMajorAxis: 20000,
                semiMinorAxis: 20000,
                material: Cesium.Color.ORANGE.withAlpha(0.2),
                height: 100
              })
            }
          }

          // 左键点击无人机实体事件
          else if (pickObject.id.name == 'UAV') {
            let dataPrimitive = getDataPrimitive(currentRef.current.province, currentRef.current.city)
            setPickUavId(pickObject.id.id)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            if (foundItem) {
              dispatch(setEntityInfo(
                {
                  ...entityInfo, // 保留之前的状态
                  id: foundItem.id.toString(),
                  // height: foundItem.height,
                  height: 2000,
                  type: 'UAV',
                  longitude: foundItem.longitude,
                  latitude: foundItem.latitude,
                  degree: foundItem.degree,
                  pitch: foundItem.pitch,
                  roll: foundItem.roll
                }
              ))
              // console.log(target)
            }
            else {
              let foundItem = viewer.entities.getById(pickObject.id.id)
              if (foundItem) {
                let pos = foundItem.position!.getValue(viewer.clock.currentTime)
                if (pos) {
                  let cartographic = Cesium.Cartographic.fromCartesian(pos)
                  let longitude = Cesium.Math.toDegrees(cartographic.longitude)
                  let latitude = Cesium.Math.toDegrees(cartographic.latitude)
                  let height = cartographic.height
                  dispatch(setEntityInfo(
                    {
                      ...entityInfo, // 保留之前的状态
                      id: foundItem.id,
                      height: height,
                      longitude: longitude,
                      latitude: latitude,
                      type: 'UAV',
                    }
                  ))
                  // console.log(longitude, typeof latitude, 777)
                }
              }
            }
          }
          else if (pickObject.id.properties) {
            let entityType = pickObject.id.properties.level._value
            if (entityType == 'province') {
              setPickUavId('')
              // console.log('点击了对象:', pickObject.id.properties.level._value);
              let count = uavCountList.find(item => item.name == pickObject.id.name)
              currentRef.current.province = pickObject.id.name
              if (count) {
                dispatch(setEntityInfo({
                  ...entityInfo, // 保留之前的状态
                  type: 'province',
                  province: pickObject.id.name,
                  id: pickObject.id.id,
                  uavCount: count.value
                }))
                dispatch(setEntityProvince(pickObject.id.name))
              }
              else {
                dispatch(setEntityInfo({
                  ...entityInfo, // 保留之前的状态
                  type: 'province',
                  province: pickObject.id.name,
                  id: pickObject.id.id,
                  uavCount: 0
                }))
                dispatch(setEntityProvince(pickObject.id.name))
              }
            }
            if (entityType == 'city' || entityType == 'district') {
              setPickUavId('')
              currentRef.current.city = pickObject.id.name
              let count: any
              let target = uavCountList.find(item => item.name == currentRef.current.province)?.cityList
              if (target) {
                count = target.find(item => item.city_name == pickObject.id.name)
                if (count) {
                  count = count.city_count
                }
              }
              dispatch(setEntityInfo({
                ...entityInfo, // 保留之前的状态
                city: pickObject.id.name,
                id: pickObject.id.id,
                uavCount: count,
                type: 'city'
              }))
              dispatch(setEntityCity(pickObject.id.name))
            }
          }
          else {
            setPickUavId('')
          }
        }
        else {
          resetLeftClick()
          setPickUavId('')
          setSelectedOption('')
          setIsClickArea(false)
          setIsConfigured(false)
          targetAreaRef.current = null
        }
      }
      else {
        resetLeftClick()
        setPickUavId('')
        setSelectedOption('')
        setIsClickArea(false)
        setIsConfigured(false)
        targetAreaRef.current = null
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 添加右键事件
    handler.setInputAction((click: any) => {
      let pickObject = viewer.scene.pick(click.position)
      console.log('右键点击了对象:', pickObject.id.position)
      if (drawModeRef.current) {
        activeShapePoints.pop()
        if (activeShapePoints.length) {
          drawShape(activeShapePoints)
        }
        drawWrapRef.current.forEach((item: any) => {
          if (item.name == 'Point') {
            item.show = false
          }
        })
        viewer.entities.remove(activeShape)
        viewer.entities.remove(floatingPoint)
        floatingPoint = undefined
        activeShape = undefined
        activeShapePoints = []
      }
      else if (Cesium.defined(pickObject) && pickObject.id.name == 'specificArea_Fixed') {
        // console.log('右键点击了对象:', pickObject.id.position)
        setIsClickArea(true)
        targetAreaRef.current = null
        targetAreaRef.current = {
          id: pickObject.id.id,
          timeSpan: '',
          confineMethod: ''
        }
        // console.log('右键点击了对象:', pickObject.id)

      }
      else if (Cesium.defined(pickObject) && pickObject.id.name == 'specificArea_Configured') {
        setIsClickArea(true)
        setIsConfigured(true)
        if (confinedAreaWrapRef.current) {
          confinedAreaWrapRef.current.forEach(item => {
            if (item.id == pickObject.id.id) {
              targetAreaRef.current = null
              targetAreaRef.current = item
            }
          })
        }
      }
      else {
        setIsClickArea(false)
        setIsConfigured(false)
        targetAreaRef.current = null
      }


    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)


    //添加移动鼠标事件
    const highlightColor = new Cesium.Color(1.0, 1.0, 1.0, 0.5)
    const defaultColor = Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3)
    let highlightedEntity: any = null;
    // 添加高亮
    handler.setInputAction(function (movement: any) {

      if (Cesium.defined(floatingPoint)) {
        let newPosition = viewer.scene.pickPosition(movement.endPosition)
        if (Cesium.defined(newPosition)) {
          activeShapePoints.pop()
          activeShapePoints.push(newPosition)
        }
      }
      // console.log(pickedObject)
      else {
        let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        let pickedObject = viewer.scene.pick(movement.endPosition)
        if (cartesian) {
          if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon
            && currentRef.current.layer != 'BOTTOM' && currentRef.current.layer != 'REALITY') {
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
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    // 添加双击事件
    handler.setInputAction((doubleClick: any) => {
      let pickObject = viewer.scene.pick(doubleClick.position)

      // console.log(pickObject)
      if (Cesium.defined(pickObject)) {
        // 世界地图层
        if (currentRef.current.layer == 'TOP') {
          if (pickObject.id.properties) {
            if (pickObject.id.properties.level) {
              if (pickObject.id.properties.level._value == 'province') {
                topContainerRef.current.forEach(item => {
                  item.show = false
                })
                currentRef.current.layer = 'MEDIUM'
                mediumContainerRef.current.splice(0, mediumContainerRef.current.length)
                switchProvinceView(viewer, pickObject.id.name, mediumContainerRef)
              }
            }
          }
        }
        // 省市地图层
        else if (currentRef.current.layer == 'MEDIUM') {
          if (pickObject.id.properties) {
            if (pickObject.id.properties.level) {
              if (pickObject.id.properties.level._value == 'city' || 'district') {
                setIsShowButton(true)
                setIsShowComponent(true)
                currentRef.current.layer = 'BOTTOM'
                switchCityView(viewer, currentRef, bottomContainerRef, cityRef)
                mediumContainerRef.current.forEach(item => {
                  item.show = false
                })
              }
            }
          }
        }

        // 现实世界层
        else if (currentRef.current.layer == 'BOTTOM' || currentRef.current.layer == 'REALITY') {
          if (pickObject.id.name == 'UAV') {
            let dataPrimitive = getDataPrimitive(currentRef.current.province, currentRef.current.city)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            if (foundItem) {
              currentRef.current.layer = 'REALITY'

              viewer.imageryLayers.get(1).show = false

              switchUavView(viewer, foundItem)
              // console.log(viewer.imageryLayers.get(1)
              bottomContainerRef.current.forEach(item => {
                if (item.name != 'UAV' && item.name != 'crediblePat' && item.name != 'tower' && item.name != 'signal') {
                  item.show = false
                }
              })
              setPickUavId('')
              // console.log(bottomContainerRef.current)

            }
          }

        }
      }
      else if (currentRef.current.layer != 'REALITY' && currentRef.current.layer != 'TOP') {
        currentRef.current.layer = 'TOP'
        // setShowBackBnt(false)
        resetAll()
      }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)


    //返回地图第一层
    const resetAll = () => {
      resetCesium(viewer, topContainerRef, mediumContainerRef, bottomContainerRef)
      setControlSignal('')
      setOnDraw(false)
      setIsShowButton(false)
      setIsShowComponent(false)
      setSelectedOption('');
      setCameraHeight(0)
      setheight('')
      setLongitude(0)
      setLatitude(0)
      setPickUavId('')
      resetLeftClick()
      targetRef.current = null
      signalRef.current = null

      dispatch(setPage('首页'))
      confinedAreaWrapRef.current = null
      targetAreaRef.current = null
      setIsConfigured(false)
      cityRef.current = true
      currentRef.current = {
        layer: 'TOP',
        province: '',
        city: '',
        cameraHeight: 0,
        cameraLongitude: 0,
        cameraLatitude: 0,
        cameraHeading: 0,
        cameraPitch: -90,
        cameraRoll: 0,
      }
      dispatch(setEntityProvince(''))
      dispatch(setEntityCity(''))
      drawModeRef.current = null
      drawWrapRef.current = null
      setSelectedValue('');
      setSelectedDate('');
      setIsPaused(true)
      setSpeedMultiplier(1)
      setPopup(null);
      setRpopup(null);
      setIsClickArea(false)
    }


    // 绘制点
    const drawPoint = (position: any) => {
      let pointGeometry = viewer.entities.add({
        name: 'Point',
        position: position,
        point: {
          color: Cesium.Color.BLUE,
          pixelSize: 3,
          outlineWidth: 1,
          outlineColor: Cesium.Color.WHITE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })
      drawWrapRef.current.push(pointGeometry)
      return pointGeometry
    }
    // 计算质心
    const calculateCentroid = (positions: any) => {
      let x = 0, y = 0, z = 0;
      for (let i = 0; i < positions.length; i++) {
        x += positions[i].x;
        y += positions[i].y;
        z += positions[i].z;
      }

      let numPositions = positions.length;
      return new Cesium.Cartesian3(x / numPositions, y / numPositions, z / numPositions);
    }
    // 绘制图形
    const drawShape = (positionData: any) => {
      let shape
      if (drawModeRef.current === 'polygon') {
        let centroid = calculateCentroid(positionData)
        shape = viewer.entities.add({
          name: 'specificArea',
          position: centroid,
          polygon: {
            hierarchy: positionData,
            material: new Cesium.ColorMaterialProperty(Cesium.Color.RED.withAlpha(0.3)),
            height: 500
          }
        })
      }
      else if (drawModeRef.current === 'circle') {
        let value = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData
        shape = viewer.entities.add({
          name: 'specificArea',
          position: activeShapePoints[0],
          ellipse: {
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              let r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2))
              return r ? r : r + 1
            }, false),
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              let r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2))
              return r ? r : r + 1
            }, false),
            material: Cesium.Color.RED.withAlpha(0.3),
            outline: true,
            height: 500
          }
        })
      }
      else if (drawModeRef.current === 'rectangle') {
        let arr = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData
        let centroid = calculateCentroid(positionData)
        shape = viewer.entities.add({
          name: 'specificArea',
          position: centroid,
          rectangle: {
            coordinates: new Cesium.CallbackProperty(() => {
              let obj = Cesium.Rectangle.fromCartesianArray(arr)
              return obj
            }, false),
            material: Cesium.Color.RED.withAlpha(0.3),
            height: 500
          }
        })
      }
      drawWrapRef.current.push(shape)
      return shape
    }

    return () => {
      viewer.destroy()
      setPickUavId('')
      setIsShowButton(false)
      setIsShowComponent(false)
      setIsPaused(true)
      setSpeedMultiplier(1)
      bottomContainerRef.current = []
      mediumContainerRef.current = []
      topContainerRef.current = []
      drawWrapRef.current = null
      drawModeRef.current = null
      signalRef.current = null
      currentRef.current = {
        layer: 'TOP',
        province: '',
        city: '',
        cameraHeight: DEFAULTCAMERAHEIGHT,
        cameraLongitude: DEFAULTCAMERALONGITUDE,
        cameraLatitude: DEFAULTCAMERALATITUDE,
        cameraHeading: 0,
        cameraPitch: -90,
        cameraRoll: 0,
      }
      setOnDraw(false)
      resetLeftClick()
      dispatch(setEntityProvince(''))
      dispatch(setEntityCity(''))
      setSelectedOption('')
      setSelectedValue('')
      setControlSignal('')
      setSpeedMultiplier(1)
      setIsClickArea(false)
      setIsConfigured(false)
      confinedAreaWrapRef.current = null
      targetRef.current = null

    }
  }, [])

  //监听页面切换
  useEffect(() => {
    if (viewerRef.current) {
      resetLeftClick()
      // console.log(currentRef)
      let viewer: Cesium.Viewer = viewerRef.current
      if (isShowComponent) {
        if (pageName == '首页') {
          // console.log(pageName, currentRef.current)
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(currentRef.current.cameraLongitude, currentRef.current.cameraLatitude, currentRef.current.cameraHeight),
            duration: 1
          })
        }
        if (pageName == '航线分析') {
          // console.log(pageName, currentRef.current)
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(currentRef.current.cameraLongitude - 0.2, currentRef.current.cameraLatitude, currentRef.current.cameraHeight - 150000),
            duration: 1
          })
        }
        if (pageName == '空域管理') {
          // console.log(pageName, currentRef.current)
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(currentRef.current.cameraLongitude, currentRef.current.cameraLatitude - 0.1, currentRef.current.cameraHeight - 160000),
            duration: 1
          })
        }
        if (pageName == '区域态势') {
          // console.log(pageName, currentRef.current)
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(currentRef.current.cameraLongitude, currentRef.current.cameraLatitude, currentRef.current.cameraHeight - 120000),
            duration: 1
          })
        }
      }
    }
  }, [pageName])

  // useEffect(() => {
  //   console.log(entityInfo, _city, _province)
  // })


  const resetLeftClick = () => {
    dispatch(setEntityInfo({
      province: '',
      city: '',
      id: '',
      type: '',
      longitude: 0,
      latitude: 0,
      height: 0,
      degree: 0,
      pitch: 0,
      roll: 0,
      uavCount: 0,
      velocity: 0
    }))
  }

  // 复位地图
  const rebackMap = () => {
    setIsShowButton(false)
    setIsShowComponent(false)
    if (viewer) {
      viewer.entities.removeAll()
      viewer.dataSources.removeAll()
      viewerInitial(viewer, topContainerRef)
    }
    mediumContainerRef.current = []
    bottomContainerRef.current = []
    currentRef.current.layer = 'TOP'

    topContainerRef.current.forEach((item: any) => {
      item.show = true
    })
    // console.log(currentRef)

  }
  // 选择控制策略
  const handleChange = (e: any) => {
    setSelectedOption(e.target.value)
  };
  // 设置限制时间
  const handleDateChange = (e: any) => {
    setSelectedDate(e.target.value)
  };
  // 提交限制区域
  const confineAareSubmit = (e: any) => {
    e.preventDefault()
    if (targetAreaRef.current != null) {
      if (selectedDate && selectedOption) {
        let tId = targetAreaRef.current.id
        targetAreaRef.current = null
        targetAreaRef.current = {
          id: tId,
          confineMethod: selectedOption,
          timeSpan: selectedDate,
          subscription: 'subsription'
        }
        if (viewer) {
          let area = viewer.entities.getById(tId)
          if (area) {
            area.name = 'specificArea_Configured'
            area.label = new Cesium.LabelGraphics({
              text: 'Confined',
              font: '40px Helvetica',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 20,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            })
          }
        }
        if (confinedAreaWrapRef.current) {
          confinedAreaWrapRef.current.push(targetAreaRef.current)
        }
        else {
          confinedAreaWrapRef.current = []
          confinedAreaWrapRef.current.push(targetAreaRef.current)
        }
      }
    }
    targetAreaRef.current = null
    setIsClickArea(false)
    setIsConfigured(false)
  }
  // 取消限制区域
  const cancelConfineAare = () => {
    if (targetAreaRef.current != null) {
      let tId = targetAreaRef.current.id
      if (confinedAreaWrapRef.current && viewer) {
        confinedAreaWrapRef.current.filter(item => item.id != tId)
        viewer.entities.removeById(tId)
      }
      targetAreaRef.current = null
      setIsClickArea(false)
      setIsConfigured(false)
    }

  }
  // 控制动画开始暂停
  const handleStartPause = () => {
    if (viewer) {
      if (isPaused) {
        viewer.clock.shouldAnimate = true;
      } else {
        viewer.clock.shouldAnimate = false;
      }
      setIsPaused(!isPaused);
    }
  };
  // 复位动画
  const handleReset = () => {
    if (viewer) {
      viewer.clock.currentTime = viewer.clock.startTime.clone();
      viewer.clock.shouldAnimate = false;
      // if (targetRef.current) {
      //   targetRef.current.forEach((item: any) => {
      //     viewer.entities.remove(item)
      //   })
      // }
      setIsPaused(true);
    }
  };
  // 控制速度
  const plusSpeed = () => {
    if (viewer) {
      if (viewer.clock.multiplier < 100) {
        viewer.clock.multiplier = viewer.clock.multiplier + 1
        setSpeedMultiplier(viewer.clock.multiplier)
      }
    }
  }
  // 改变动画速度
  const slowSpeed = () => {
    if (viewer) {
      if (viewer.clock.multiplier > -100) {

        viewer.clock.multiplier = viewer.clock.multiplier - 1
        setSpeedMultiplier(viewer.clock.multiplier)
      }
    }
  }

  // 切换影像
  const switchLayer = () => {
    if (viewer) {
      viewer.imageryLayers.raiseToTop(viewer.imageryLayers.get(0))
    }
    // setIsShowComponent(!isShowComponent)
  }

  //选择绘制模式
  const switchDrawMode = (e: any) => {

    let value = e.target.value
    if (value) {
      switch (value) {
        case 'null':
          drawModeRef.current = ''
          break;
        case 'polygon':
          drawModeRef.current = 'polygon'
          break;
        case 'rectangle':
          drawModeRef.current = 'rectangle'
          break;
        case 'circle':
          drawModeRef.current = 'circle'
          break;
        default:
          break;
      }
    }
    setSelectedValue(drawModeRef.current)

  }
  // 清除绘制
  const clearFunc = () => {
    if (drawWrapRef.current) {
      drawWrapRef.current.forEach((item: any) => {
        if (viewer) {
          if (item.name == 'specificArea') {
            viewer.entities.removeById(item.id)
          }
        }
        else {
          if (item.name == 'specificArea') {
            item.show = false
          }
        }
      })
    }
    drawWrapRef.current = []
  }
  // 结束绘制
  const drawEnd = () => {
    setOnDraw(!onDraw)
    setSelectedValue('')
    drawModeRef.current = null
    drawWrapRef.current.forEach((item: any) => {
      if (item.name == 'specificArea') {
        item.name = 'specificArea_Fixed'
      }
    });
  }
  // 获取相机状态
  const saveCameraState = (viewer: Cesium.Viewer) => {
    const cameraPosition = viewer.camera.position.clone(); // 复制当前相机位置
    const heading = viewer.camera.heading; // 获取航向
    const pitch = viewer.camera.pitch;     // 获取俯仰
    const roll = viewer.camera.roll;       // 获取滚转

    let cameraState = {
      position: {
        x: cameraPosition.x,
        y: cameraPosition.y,
        z: cameraPosition.z
      },
      orientation: {
        heading: heading,
        pitch: pitch,
        roll: roll
      }
    };
    return cameraState;
  };

  // 点击航线事件
  let cameraState: any = null
  let timeWrap: NodeJS.Timeout[] = []
  const handleClickFlightList = () => {
    timeWrap.forEach(item => {
      clearTimeout(item)
    })
    timeWrap = []
    if (viewer) {
      const pathEntity = viewer.entities.getById(`prePath`)
      if (pathEntity) {
        if (!cameraState) {
          cameraState = saveCameraState(viewer)
        }
        if (cameraState) {
          // console.log(cameraState)
          viewer.flyTo(pathEntity, {
            duration: 1
          })
          const _inTime = setTimeout(() => {
            console.log(cameraState)
            viewer.camera.flyTo({
              destination: new Cesium.Cartesian3(
                cameraState.position.x, cameraState.position.y, cameraState.position.z
              ),
              orientation: {
                heading: cameraState.orientation.heading,
                pitch: cameraState.orientation.pitch,
                roll: cameraState.orientation.roll
              },
              duration: 2
            })
          }, 3000)
          timeWrap.push(_inTime)
          if (pathEntity.polyline) {
            let currentWidth = 10; // 初始宽度
            pathEntity.polyline.width = new Cesium.CallbackProperty(() => {
              return currentWidth
            }, false)
            const targetWidth = 50; // 目标宽度
            const duration = 1000; // 动画持续时间，单位毫秒
            let startTime = new Date().getTime();
            const animate = () => {
              const elapsedTime = new Date().getTime() - startTime;
              const progress = Math.min(elapsedTime / duration, 1); // 最大值为1

              // 计算当前宽度
              currentWidth = 10 + progress * (targetWidth - 10); // 从5变到10

              if (progress < 1) {
                requestAnimationFrame(animate); // 继续执行动画
              } else {
                // 恢复到原来的宽度
                const _outTime = setTimeout(() => {
                  startTime = new Date().getTime();

                  const resetAnimation = () => {
                    const elapsedTime = new Date().getTime() - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);

                    currentWidth = targetWidth - progress * (targetWidth - 10); // 从10变回5

                    if (progress < 1) {
                      requestAnimationFrame(resetAnimation);
                    }
                  };

                  requestAnimationFrame(resetAnimation);
                }, 2000); // 等待1秒后恢复
                timeWrap.push(_outTime)
              }
            };

            requestAnimationFrame(animate);
          }
        }
      }
    }

  }






  return (
    <div>
      {/* 提交成功提示框 */}
      <div className='submit_success'><SubmitSuccess message={controlSignal} targetId={pickUavId}></SubmitSuccess></div>
      <div className='map_content_container'>
        {/* 导航栏 */}
        <div className='map_nav'>
          <Navigator currentState={currentRef.current.layer}></Navigator>
          <div className={`layout_container ${isShowComponent ? 'show' : ''}`}>
            {pageName === '首页' && <HomePage></HomePage>}
            {pageName === '航线分析' && <FlightRouteStatistics handleClickFlightList={handleClickFlightList}></FlightRouteStatistics>}
            {pageName === '空域管理' && <AirspaceManagement province={currentRef.current.province} city={currentRef.current.city}></AirspaceManagement>}
            {pageName === '区域态势' && <RegionalSituation switchLayer={switchLayer}></RegionalSituation>}
          </div>
        </div>
        {/* 详细信息框 */}
        {popup && <div
          className={`pop ${entityInfo?.type === 'UAV' ? '' : 'hide'}`}
          style={{
            top: popup!.y,
            left: popup!.x,
          }}>
          <PickedInfo></PickedInfo>
        </div>}
        {/* 设置限制区域信息 */}
        {rPopup && <div
          className={`pop ${isClickArea ? '' : 'hide'}`}
          style={{
            top: rPopup!.y,
            left: rPopup!.x,
          }}
        >
          <div className='uavInfo_content'>
            <div className='confine_title'>
              <span> CityArea Restricted</span>
              {isConfigured && <button className='uav_control_button' style={{ padding: '1px,3px,1px,3xp' }} onClick={cancelConfineAare}>Unfreeze</button>}
            </div>
            <span className='uavInfo_title' >
              {targetAreaRef.current && <span>{targetAreaRef.current.timeSpan ? targetAreaRef.current.timeSpan : 'Not Configure'}</span>}
              {!targetAreaRef.current && <span>Not Configure</span>}
              <img src={confineImg} alt="" />
            </span>
            <span>Subscription:</span>
            <span style={{ width: '400px' }}>
              {targetAreaRef.current && <div>{targetAreaRef.current.subscription ? targetAreaRef.current.subscription : ''}</div>}
            </span>
          </div>
          {!isConfigured && <div className='uavInfo_control'>
            <span className='uavInfo_title' style={{ fontSize: '30px' }}>限制区控制策略</span>
            <div>
              <form onSubmit={confineAareSubmit} >
                <div className='confine_wrap'>
                  <div><span className='confine_title'>请输入限飞有效期</span></div>
                  <div><input type="date" className='input_time' value={selectedDate} onChange={handleDateChange} /></div>
                </div>
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
                  <button className='uav_control_button' type="button" onClick={() => { setPickUavId(''); setSelectedOption(''); targetAreaRef.current = null; setIsClickArea(false) }}>Cancel</button>
                </div>
              </form>

            </div>
          </div>}
        </div>}
        {/* 按钮集合 */}
        {isShowButton && <div className='cesium_button_container'>
          {pageName === '航线分析' && <div className='flight_button_wrap'>
            <div className='cesium_button' onClick={() => { rebackMap() }}>返回/BACK</div>
            <div className='cesium_button' onClick={switchLayer}>切换影像/Switch</div>
          </div>}
          {/* <button className='home_button' onClick={handleStartPause}>{isPaused ? '开始/Start' : '暂停/Pause'}</button>
          <button className='home_button' onClick={handleReset}>重置动画/Reset</button>
          <button className='home_button' onClick={plusSpeed}>加速/Boost</button>
          <span style={{ color: 'white', fontSize: '30px' }}>{speedMultiplier}</span>
          <button className='home_button' onClick={slowSpeed}>减速/Slow</button> */}
          {pageName === '空域管理' && <div className='airspace_button_wrap'>
            <div className='cesium_button' onClick={drawEnd}>{`${onDraw ? '点击开始/Draw' : '点击保存/Drawing'}`}</div>
            <div className='cesium_button' onClick={clearFunc}>清除/Clear</div>
            <div className={`drawer_wrap ${onDraw ? '' : 'show'}`}>
              <div className='drawer_select_container'>
                <select className="drawmode_select" id="dropdown" value={selectedValue} onChange={switchDrawMode}>
                  <option value="null">选择一个模式</option>
                  <option value="polygon">绘制多边形</option>
                  <option value="rectangle">绘制矩形</option>
                  <option value="circle">绘制圆形</option>
                </select>
              </div>
            </div>
          </div>}
        </div>}
        {/* 底边位置信息栏 */}
        <div className="bottom_bar">
          <div className="coordinate">Longitude: {longitude_ALL}° &nbsp;&nbsp;&nbsp; Latitude:{latitude_ALL}°
            &nbsp;&nbsp;&nbsp;Height: {height_ALL} m &nbsp;&nbsp;cameraHeight: {cameraHeight}
          </div>
        </div>

      </div>

      {/* 地图盒子 */}
      <div className="cesiumContainer" id='cesium_map' ref={cesiumContainerRef} onClick={handleClick} onContextMenu={rightHandleClick}>
      </div>
      <div className='map_overolay'></div>
    </div>

  )
}


export default CesiumMap;

