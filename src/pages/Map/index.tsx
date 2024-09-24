import './index.less'
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import { DataPoint, Point, PopXY, ConfinedArea } from '../../global-env';
import viewerInitial from './MapMethods/viewerInitial';
import loadResources from './MapMethods/loadResources';
import { CESIUMTOKEN, MAPBOX_USER } from './MapMethods/Setting';
import switchProvinceView from './MapMethods/switchProvinceView';
import resetAll from './MapMethods/resetAll';
import switchCityView from './MapMethods/switchCityView';
import { getDataPrimitive, findItemById } from "./MapMethods/methodsRepo"
import PickedInfo from './components/PickedInfo';
import confineImg from '../../asset/confine.png'
import switchUavView from './MapMethods/switchUavView';
import SubmitSuccess from './MapMethods/SubmitSuccess';
import Navigator from './components/Navigator';



const CesiumMap: React.FC = () => {
  const subsription = 'Drone flight restrictions ensure safety, prevent accidents, protect privacy, and comply with regulations to avoid interference and safeguard sensitive areas.'
  const [controlSignal, setControlSignal] = useState('')
  const [onDraw, setOnDraw] = useState(true)
  const [showBackBnt, setShowBackBnt] = useState(false)
  const [selectedOption, setSelectedOption] = useState('');
  const [cameraHeight, setCameraHeight] = useState(0)
  const [height_ALL, setheight] = useState('')
  const [longitude_ALL, setLongitude] = useState(0)
  const [latitude_ALL, setLatitude] = useState(0)
  const [pickUavId, setPickUavId] = useState('')
  const [target, setTarget] = useState<Point>({
    province: '北京市',
    city: '',
    id: '',
    longitude: 0,
    latitude: 0,
    height: 0,
    degree: 0,
    pitch: 0,
    roll: 0,
    uavCount: 0
  })
  const targetRef = useRef<any>([])
  const signalRef = useRef<any>(null)

  const confinedAreaWrapRef = useRef<ConfinedArea[] | null>(null)
  const targetAreaRef = useRef<ConfinedArea | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  const cesiumContainerRef = useRef<Cesium.Viewer | any>(null)
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null)
  const currentRef = useRef<CurrentLocation | any>(null)
  const topContainerRef = useRef<any[]>([])
  const mediumContainerRef = useRef<any[]>([])
  const bottomContainerRef = useRef<any[]>([])
  const startPointRef = useRef<any>(null)
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

  // 影像层选取
  const imageryProviders = [
    // new Cesium.ImageryLayer.fromWorldImagery(),,
    Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(2), {}),
    new Cesium.ImageryLayer(new Cesium.MapboxStyleImageryProvider({
      username: MAPBOX_USER.username,
      styleId: 'clzi16g9c00h501pr4mtt3owf',
      accessToken: MAPBOX_USER.token,
    }))
  ]

  // 地图主体
  useEffect(() => {

    // 加载数据
    const data = loadResources()

    // 初始化cesium地图组件
    const uavCountList: DataPoint[] = data.uavCountList

    Cesium.Ion.defaultAccessToken = CESIUMTOKEN

    // 初始化Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
      baseLayer: imageryProviders[0],
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


    setViewer(viewer)
    viewer.imageryLayers.add(imageryProviders[1])
    drawWrapRef.current = []


    const currentState: CurrentLocation = {
      layer: 'TOP',
      province: '',
      city: ''
    }

    let activeShapePoints = [] as any[]
    let activeShape: any = null
    let floatingPoint: any = null


    currentRef.current = currentState
    viewerInitial(viewer, topContainerRef)


    // 添加左键点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(function onLeftClick(click: any) {
      let pickObject = viewer.scene.pick(click.position)
      let pickedPosition = viewer.scene.pickPosition(click.position)
      setRpopup(null)
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
      if (Cesium.defined(pickObject)) {
        // setPickId('')
        if (pickObject.id) {
          // console.log('点击了对象:', pickObject.id);

          if (pickObject.id.name == '昌平区') {
            cityRef.current = true
            bottomContainerRef.current.forEach(item => {
              if (item.name == '延庆区_entity') {
                item.polygon.material = Cesium.Color.GRAY.withAlpha(0.3)
              }
              if (item.name == '昌平区') {
                item.polygon.material = Cesium.Color.fromCssColorString('#00868B').withAlpha(0.1)
              }
            })
            setPickUavId('')
            setSelectedOption('')
            setIsClickArea(false)
            setIsConfigured(false)
            targetAreaRef.current = null
          }
          else if (pickObject.id.name == 'tower') {
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
          else if (pickObject.id.name == 'UAV') {
            let dataPrimitive = getDataPrimitive(currentState.province, currentState.city)
            setPickUavId(pickObject.id.id)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            if (foundItem) {
              setTarget(item => ({
                ...item,
                id: foundItem.id.toString(),
                // height: foundItem.height,
                height: 2000,
                longitude: foundItem.longitude,
                latitude: foundItem.latitude,
                degree: foundItem.degree,
                pitch: foundItem.pitch,
                roll: foundItem.roll
              }))
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
                  setTarget(item => ({
                    ...item,
                    id: foundItem.id,
                    height: height,
                    longitude: longitude,
                    latitude: latitude,
                  }))
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
                count = target.find(item => item.city_name == pickObject.id.name)
                if (count) {
                  count = count.city_count
                }
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
        else {
          setPickUavId('')
          setSelectedOption('')
          setIsClickArea(false)
          setIsConfigured(false)
          targetAreaRef.current = null
        }
      }
      else {
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
            && currentState.layer != 'BOTTOM' && currentState.layer != 'REALITY') {
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
        if (currentState.layer == 'TOP') {
          if (pickObject.id.properties) {
            if (pickObject.id.properties.level) {
              if (pickObject.id.properties.level._value == 'province') {
                topContainerRef.current.forEach(item => {
                  item.show = false
                })
                currentState.layer = 'MEDIUM'
                mediumContainerRef.current.splice(0, mediumContainerRef.current.length)
                switchProvinceView(viewer, pickObject.id.name, mediumContainerRef)
              }
            }
          }
        }

        else if (currentState.layer == 'MEDIUM') {
          if (pickObject.id.properties) {
            if (pickObject.id.properties.level) {
              if (pickObject.id.properties.level._value == 'city' || 'district') {
                setShowBackBnt(true)
                currentState.layer = 'BOTTOM'
                switchCityView(viewer, currentState.province, currentState.city, bottomContainerRef, startPointRef, cityRef)
                mediumContainerRef.current.forEach(item => {
                  item.show = false
                })
              }
            }
          }
        }
        else if (currentState.layer == 'BOTTOM' || currentState.layer == 'REALITY') {
          if (pickObject.id.name == 'UAV') {
            let dataPrimitive = getDataPrimitive(currentState.province, currentState.city)
            let foundItem = findItemById(dataPrimitive.origin, pickObject.id.id)
            if (foundItem) {
              currentState.layer = 'REALITY'

              // viewer.imageryLayers.get(1).show = false

              switchUavView(viewer, foundItem)
              // console.log(viewer.imageryLayers.get(1)
              // bottomContainerRef.current.forEach(item => {
              //   if (item.name != 'UAV' && item.name != 'crediblePath'&& item.name != 'tower'&& item.name != 'signal') {
              //     item.show = false
              //   }
              // })
              setPickUavId('')
              // console.log(bottomContainerRef.current)

            }
          }

        }
      }
      else if (currentState.layer != 'REALITY' && currentState.layer != 'TOP') {
        currentState.layer = 'TOP'
        setShowBackBnt(false)
        resetAll(viewer, topContainerRef, mediumContainerRef, bottomContainerRef)
      }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)


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
      setShowBackBnt(false)
      setIsPaused(true)
      setSpeedMultiplier(1)
      bottomContainerRef.current = []
      mediumContainerRef.current = []
      topContainerRef.current = []
      drawWrapRef.current = null
      drawModeRef.current = null
      signalRef.current = null
      currentRef.current = null
      setOnDraw(false)
      target.id = ''
      target.height = 0
      target.longitude = 0
      target.latitude = 0
      target.degree = 0
      target.pitch = 0
      target.roll = 0
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

  // 复位地图
  const rebackMap = () => {
    setShowBackBnt(false)
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
  // 提交控制信号
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setControlSignal(selectedOption)
    signalRef.current = selectedOption

    if (viewer) {
      let newPositionProperty = new Cesium.SampledPositionProperty()
      if (selectedOption === 'PersuasionBack') {
        let targetUav = viewer.entities.getById(target.id.toString())
        if (targetRef.current) {
          targetRef.current.push(targetUav)
        } else {

          targetRef.current = []
          targetRef.current.push(targetUav)
        }
        if (targetUav) {
          if (targetUav.position) {
            let targetUav = viewer.entities.getById(target.id)
            if (targetUav) {
              targetUav.label = new Cesium.LabelGraphics({
                text: '区域遣返，重新规划',
                font: '20px Helvetica',
                fillColor: Cesium.Color.YELLOW,
                // outlineColor: Cesium.Color.RED,
                outlineWidth: 20,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40)
              })
              targetUav.path = new Cesium.PathGraphics({
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                  color: new Cesium.CallbackProperty(() => Cesium.Color.YELLOW, false),
                  dashLength: 30
                }),
                width: 3,
                leadTime: 0,
                trailTime: 3000
              })
              if (targetUav.position) {
                let pos = targetUav.position.getValue(viewer.clock.currentTime)
                if (pos) {
                  let cartoPos = Cesium.Cartographic.fromCartesian(pos)
                  let lo = Cesium.Math.toDegrees(cartoPos.longitude)
                  let la = Cesium.Math.toDegrees(cartoPos.latitude)
                  let ht = cartoPos.height
                  let newCartoPos = Cesium.Cartesian3.fromDegrees(lo + 0.1, la + 0.1, ht)
                  let startPos: any = null

                  startPointRef.current.forEach((item: any) => {
                    if (target.id == item[0]) {
                      if (item[0] === 'FaultyUav') {
                        startPos = [item[1], item[2]]
                      }
                      else {
                        startPos = item[1]
                      }
                    }
                  })
                  console.log('startPointRef', startPointRef.current)
                  console.log('start', startPos)
                  if (startPos) {
                    let newPosList = [] as any[]
                    let span = viewer.clock.currentTime.secondsOfDay - viewer.clock.startTime.secondsOfDay
                    if (!startPos.length) {
                      console.log('1')
                      newPosList = [startPos, pos, newCartoPos]
                      for (let i = 0; i < 3; i++) {
                        if (i == 0) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 0, new Cesium.JulianDate())

                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        if (i == 1) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, span, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        if (i == 2) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 40, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])

                        }
                        targetUav.position = newPositionProperty
                        targetUav.orientation = new Cesium.VelocityOrientationProperty(newPositionProperty)
                        setSelectedOption('')
                        signalRef.current = null
                      }
                    } else if (span > 20 && startPos.length == 2) {
                      console.log('2')

                      newPosList = [startPos[0], startPos[1], pos, newCartoPos]
                      for (let i = 0; i < 4; i++) {
                        if (i == 0) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 0, new Cesium.JulianDate())

                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        if (i == 1) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 20, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        if (i == 2) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, span, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])

                        } else {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 40, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        targetUav.position = newPositionProperty
                        targetUav.orientation = new Cesium.VelocityOrientationProperty(newPositionProperty)
                        setSelectedOption('')
                        signalRef.current = null
                      }
                    } else if (span < 20 && startPos.length == 2) {
                      console.log('3')
                      newPosList = [startPos[0], pos, newCartoPos]
                      for (let i = 0; i < 3; i++) {
                        if (i == 0) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 0, new Cesium.JulianDate())

                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        if (i == 1) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, span, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])
                        }
                        if (i == 2) {
                          let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 40, new Cesium.JulianDate())
                          newPositionProperty.addSample(time, newPosList[i])

                        }
                        targetUav.position = newPositionProperty
                        targetUav.orientation = new Cesium.VelocityOrientationProperty(newPositionProperty)
                        setSelectedOption('')
                        signalRef.current = null
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      else if (selectedOption === 'ForcedLanding') {
        let targetUav = viewer.entities.getById(target.id.toString())
        if (targetRef.current) {
          targetRef.current.push(targetUav)
        }
        else {
          targetRef.current = []
          targetRef.current.push(targetUav)
        }
        if (targetUav) {
          targetUav.label = new Cesium.LabelGraphics({
            text: '区域迫降',
            font: '20px Helvetica',
            fillColor: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 20,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -40)
          })
          if (targetUav.position) {
            let pos = targetUav.position.getValue(viewer.clock.currentTime)
            if (pos) {
              let cartoPos = Cesium.Cartographic.fromCartesian(pos)
              let lo = Cesium.Math.toDegrees(cartoPos.longitude)
              let la = Cesium.Math.toDegrees(cartoPos.latitude)
              let newCartoPos = Cesium.Cartesian3.fromDegrees(lo, la, 0)
              let newPosList = [pos, newCartoPos, newCartoPos]
              for (let i = 0; i < 3; i++) {
                let time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, i * 20, new Cesium.JulianDate())
                newPositionProperty.addSample(time, newPosList[i])
              }
              targetUav.position = newPositionProperty
              setSelectedOption('')
              signalRef.current = null

            }
          }
        }
      }
      signalRef.current = null
      setSelectedOption('')
    }
    setTimeout(() => { setControlSignal(''), setPickUavId('') }, 500)
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
          subscription: subsription
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



  return (
    <div className='total_wrap'>
      {/* 提交成功提示框 */}
      <div className='submit_success'><SubmitSuccess message={controlSignal} targetId={pickUavId}></SubmitSuccess></div>
      <div className="container_map">
        {/* 导航栏 */}
        <Navigator></Navigator>
        {/* 底边位置信息栏 */}
        <div className="bottom_bar">
          <div className="coordinate">Longitude: {longitude_ALL}° &nbsp;&nbsp;&nbsp; Latitude:{latitude_ALL}°
            &nbsp;&nbsp;&nbsp;Height: {height_ALL} m &nbsp;&nbsp;cameraHeight: {cameraHeight}
          </div>
        </div>
        {/* 详细信息框 */}
        {popup && <div
          className={`pop ${pickUavId ? '' : 'hide'}`}
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
        {/* 动画播放按钮 */}
        <div className={`home_button_wrap ${showBackBnt ? '' : 'close'}`}>
          <button className='home_button' onClick={() => { rebackMap() }}>返回/BACK</button>
          <button className='home_button' onClick={switchLayer}>切换影像/Switch</button>
          <button className='home_button' onClick={handleStartPause}>{isPaused ? '开始/Start' : '暂停/Pause'}</button>
          <button className='home_button' onClick={handleReset}>重置动画/Reset</button>
          <button className='home_button' onClick={plusSpeed}>加速/Boost</button>
          <span style={{ color: 'white', fontSize: '30px' }}>{speedMultiplier}</span>
          <button className='home_button' onClick={slowSpeed}>减速/Slow</button>
          {/* 绘画按钮 */}
          <button className='home_button' onClick={drawEnd}>{`${onDraw ? '点击开始/Draw' : '点击保存/Drawing'}`}</button>
          <button className='home_button' onClick={clearFunc}>清除/Clear</button>
          <div className={`drawer_wrap ${onDraw ? '' : 'show'}`}>
            <div className='select_container'>
              <select className="drawmode_select" id="dropdown" value={selectedValue} onChange={switchDrawMode}>
                <option value="null">选择一个模式</option>
                <option value="polygon">绘制多边形</option>
                <option value="rectangle">绘制矩形</option>
                <option value="circle">绘制圆形</option>
              </select>
            </div>
          </div>
        </div>

        {/* 地图盒子 */}
        <div className="cesiumContainer" ref={cesiumContainerRef} onClick={handleClick} onContextMenu={rightHandleClick}>
        </div>
      </div>
    </div>

  )
}
export default CesiumMap;

