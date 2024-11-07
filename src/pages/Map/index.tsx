import './index.less'
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { DataPoint, PopXY, ConfinedArea } from '../../global-env';
import viewerInitial from './MapMethods/viewerInitial';
import loadResources from './MapMethods/loadResources';
import { CESIUMTOKEN, DEFAULTCAMERAHEIGHT, DEFAULTCAMERALATITUDE, DEFAULTCAMERALONGITUDE, MAPBOX_USER } from './MapMethods/setting';
import switchProvinceView from './MapMethods/switchProvinceView';
import resetCesium from './MapMethods/resetCesium';
import switchCityView from './MapMethods/switchCityView';
import { getDataPrimitive, findItemById } from "./MapMethods/methodsRepo"
import PickedInfo from './components/PickedInfo';
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
import RightClick from './components/RightClick';
import { resetAllParams, setConfineMethod, setId, setIsConfigured, setSubscription, setTimeSpan, setType } from '../../store/modules/rightClickTargetReducer';
import { removeAlertQueue, setFinishedAlerts } from '../../store/modules/alertQueueReducer';

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
  const { entityInfo } = useSelector((state: RootState) => state.onLeftClickTarget)
  const { finishedAlerts } = useSelector((state: RootState) => state.alertQueueStore)

  const [controlSignal, setControlSignal] = useState('')
  const [onDraw, setOnDraw] = useState(false)
  const [isShowButton, setIsShowButton] = useState(false)
  const [isShowComponent, setIsShowComponent] = useState(false)
  const [cameraHeight, setCameraHeight] = useState(0)
  const [height_ALL, setheight] = useState('')
  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickUavId, setPickUavId] = useState('')
  const targetRef = useRef<any>([])
  const signalRef = useRef<any>(null)

  const { pageName } = useSelector((state: RootState) => state.pageSwitch)

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
  const [popup, setPopup] = useState<PopXY | null>(null);
  const [rPopup, setRpopup] = useState<PopXY | null>(null);
  const confinedAreaStore = useRef<ConfinedArea | any>([])
  const { type } = useSelector((state: RootState) => state.onRightClickTarget)

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
    viewerInitial(viewer, topContainerRef)
    initialMouseEvent(viewer)
    viewer.imageryLayers.add(imageryProviders[0])


    return () => {
      viewer.destroy()
      setPickUavId('')
      setIsShowButton(false)
      setIsShowComponent(false)
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
      setSelectedValue('')
      setControlSignal('')
      targetRef.current = null

    }
  }, [])

  //初始化所有鼠标点击事件
  const initialMouseEvent = (viewer: Cesium.Viewer) => {
    // 加载数据
    const data = loadResources()
    // 初始化cesium地图组件
    const uavCountList: DataPoint[] = data.uavCountList
    drawWrapRef.current = []
    let activeShapePoints = [] as any[]
    let activeShape: any = null
    let floatingPoint: any = null

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
        if (pickObject.id) {
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
          dispatch(resetAllParams())
        }
      }
      else {
        resetLeftClick()
        setPickUavId('')
        dispatch(resetAllParams())
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 添加右键事件
    handler.setInputAction((click: any) => {
      dispatch(resetAllParams())
      let pickObject = viewer.scene.pick(click.position)
      // console.log('右键点击了对象:', pickObject.id)
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
      else if (Cesium.defined(pickObject) && pickObject.id.name == 'specificArea_Fixed' && !selectedValue) {
        // console.log('右键点击了对象:', pickObject.id.position)
        dispatch(setId(pickObject.id.id))
        dispatch(setType('area'))
        dispatch(setIsConfigured(false))
      }
      else if (Cesium.defined(pickObject) && pickObject.id.name == 'specificArea_Configured' && !selectedValue) {
        dispatch(setId(pickObject.id.id))
        dispatch(setType('area'))
        dispatch(setIsConfigured(true))
        let target = confinedAreaStore.current.find((item: any) => item.id === pickObject.id.id)
        if (target) {
          dispatch(setTimeSpan(target.timeSpan))
          dispatch(setSubscription(target.subscription))
          dispatch(setConfineMethod(target.confineMethod))
        }
      }
      else {
        dispatch(resetAllParams())
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
                switchCityView(viewer, currentRef, bottomContainerRef, dispatch, finishedAlerts)
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
      setCameraHeight(0)
      setheight('')
      setLongitude(0)
      setLatitude(0)
      setPickUavId('')
      resetLeftClick()
      targetRef.current = null
      signalRef.current = null

      dispatch(setPage('首页'))
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
      setPopup(null);
      setRpopup(null);
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
  }


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

  //重置左键点击
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
  const handleClickFlightList = (flight_number: string) => {
    timeWrap.forEach(item => {
      clearTimeout(item)
    })
    timeWrap = []
    if (viewer) {
      const pathEntity = viewer.entities.getById(flight_number)
      bottomContainerRef.current.forEach((item: any) => {
        if (item.id != flight_number && item.name != 'tower' && item.name != '延庆区' && item.id != `UAV-${flight_number}`) {
          item.show = false
        }
      })
      let _timeOut = setTimeout(() => {
        bottomContainerRef.current.forEach((item: any) => {
          if (item.id != flight_number && item.name != 'tower' && item.name != '延庆区' && item.id != `UAV-${flight_number}`) {
            item.show = true
          }
        })
      }, 4000);
      timeWrap.push(_timeOut)

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
            const targetWidth = 100; // 目标宽度
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
                }, 2000); // 等待2秒后恢复
                timeWrap.push(_outTime)
              }
            };

            requestAnimationFrame(animate);
          }
        }
      }
    }

  }

  //点击警告事件处理
  const clickTohandleAlert = (id: string) => {
    // console.log('clickTohandleAlert')
    if (viewer) {
      let target = viewer.entities.getById(id)
      if (target) {
        viewer.flyTo(target, {
          duration: 0.5,
          offset: new Cesium.HeadingPitchRange(0, -50, 30000)
        })
        // let position = target.position?.getValue(Cesium.JulianDate.now())
        let position = target.position?.getValue(viewer.clock.currentTime)

        if (position) {
          let screenPosition = viewer.scene.cartesianToCanvasCoordinates(position)
          let cartographic = Cesium.Cartographic.fromCartesian(position)
          let longitude = Cesium.Math.toDegrees(cartographic.longitude)
          let latitude = Cesium.Math.toDegrees(cartographic.latitude)
          let height = cartographic.height
          dispatch(setEntityInfo(
            {
              ...entityInfo, // 保留之前的状态
              id: target.id,
              height: height,
              longitude: longitude,
              latitude: latitude,
              type: 'UAV',
            }
          ))
          setPopup({ x: screenPosition.x, y: screenPosition.y })
        }
      }
    }
  }

  //控制策略
  const informMessage = (id: string, message: string) => {
    if (viewer) {
      let target = viewer.entities.getById(id)
      if (target) {
        target.label = new Cesium.LabelGraphics({
          text: message,
          font: '16px Helvetica',
          outlineWidth: 2,
          outlineColor: Cesium.Color.fromCssColorString('#871212').withAlpha(0.5),
          fillColor: Cesium.Color.GREEN.withAlpha(1),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -30)
        })
        target.path = new Cesium.PathGraphics({
          leadTime: 0,
          trailTime: 3000,
          width: 5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#871212'),
            dashLength: 50,
          })
        })

        if (message == '迫降') {
          let nowPosition = target.position?.getValue(viewer.clock.currentTime)
          let orientation = target.orientation?.getValue(viewer.clock.currentTime)
          target.position = new Cesium.ConstantPositionProperty(nowPosition)
          target.orientation = new Cesium.ConstantProperty(orientation)
        }
        if (message == '遣返') {
          let nowPosition = target.position?.getValue(viewer.clock.currentTime)
          if (nowPosition) {
            let startPosition = Cesium.Cartesian3.fromDegrees(115.89628, 40.48825)
            let positionList = [nowPosition, startPosition]
            let startTime = viewer.clock.currentTime
            let newVelocityProperty = new Cesium.SampledPositionProperty()
            for (let i = 0; i < 2; i++) {
              let time = Cesium.JulianDate.addSeconds(startTime, i * 10, new Cesium.JulianDate())
              newVelocityProperty.addSample(time, positionList[i])
            }
            target.position = newVelocityProperty
            target.orientation = new Cesium.VelocityOrientationProperty(newVelocityProperty)
          }
        }
        dispatch(removeAlertQueue(id))
        dispatch(setFinishedAlerts({
          id: id,
          title: message,
          content: '飞行路线与预定路线不一致',
          isFinished: true
        }))
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
            {pageName === '首页' && <HomePage clickTohandleAlert={clickTohandleAlert}></HomePage>}
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
          <PickedInfo informMessage={informMessage}></PickedInfo>
        </div>}
        {/* 设置限制区域信息 */}
        {rPopup && type == 'area' && <RightClick pickedX={rPopup.x} pickedY={rPopup.y} viewer={viewer} confinedAreaStore={confinedAreaStore.current}
        ></RightClick>}
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
            <div className='cesium_button' onClick={drawEnd}>{`${!onDraw ? '点击开始/Draw' : '点击保存/Drawing'}`}</div>
            <div className='cesium_button' onClick={clearFunc}>清除/Clear</div>
            <div className={`drawer_wrap ${onDraw ? 'show' : ''}`}>
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

