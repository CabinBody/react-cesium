
import * as Cesium from "cesium";
import React, { useEffect, useRef } from "react";
import './CesiumMap.less'
import { getDataPrimitive } from './utils/PointGenerater'
import { getProvinceList } from "./utils/GetProvince";



const CESIUMTOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOWQ3ZDc5Zi0yZjM2LTRhZWMtOWM3Ny0yMjI1NDUwNmU1Y2IiLCJpZCI6MjI5NjgyLCJpYXQiOjE3MjE1NDk3NjR9.I6PpMJnwxUZhQTq_pdB2F2t4S3uugj9E1xNXxcWtC1E'
// const TIDITUTOKEN = '32887750f8cf1c0d28e57dd13fd9c9b2'
// const targetLongitude = 108.9109251
// const targetLatitude = 30.3731565

//两个因为版本问题更新的新方法
const addWorldTerrainAsync = async (viewer: Cesium.Viewer) => {
  try {
    const terrainProvider = await Cesium.createWorldTerrainAsync({
      requestVertexNormals: true,
      requestWaterMask: true,
    });
    viewer.terrainProvider = terrainProvider;
  } catch (error) {
    // console.log('Failed to add world imagery: ', { error });
  }
};

const addOsmBuildingsAsync = async (viewer: Cesium.Viewer) => {
  try {
    const osmBuildings = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(osmBuildings);
  } catch (error) {
    // console.log('Failed to add OSM buildings: ', { error });
  }
};


const CesiumMap: React.FC = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  // 获取点集

  const dataPrimitive = getDataPrimitive()
  const province = getProvinceList()

  // const route = [
  //   Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 500),
  //   Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0553706, 500),
  //   Cesium.Cartesian3.fromDegrees(-123.0704619, 44.0553706, 500),
  //   Cesium.Cartesian3.fromDegrees(-123.0704619, 44.0503706, 500),
  // ]

  useEffect(() => {
    if (!cesiumContainerRef.current) return;
    // 初始化token
    Cesium.Ion.defaultAccessToken = CESIUMTOKEN
    // 初始化Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
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
    // 添加内置的地形和白膜建筑物
    addWorldTerrainAsync(viewer)
    addOsmBuildingsAsync(viewer)
    // 取消默认的点击事件
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //
    viewer.scene.globe.show = false
    viewer.scene.skyAtmosphere.show = false
    viewer.scene.backgroundColor = Cesium.Color.WHITE
    viewer.scene.skyBox.show = false 

     //添加默认的无人机实体
    if (dataPrimitive.cartesianPointList) {
      for (let index = 0; index < dataPrimitive.cartesianPointList.length; index++) {
        var position = dataPrimitive.cartesianPointList[index]
        if (dataPrimitive.hprList) {
          // console.log(dataPrimitive.hprList)
          var hpr = dataPrimitive.hprList[index]
          viewer.entities.add({
            name: `UAV ${index + 1}`,
            position: position,
            model: {
              uri: '../public/UAV.glb',
              minimumPixelSize: 42,
            },
            orientation:Cesium.Transforms.headingPitchRollQuaternion(position,hpr)
          });
        }
      }
    }


    // 添加各省的名称
    province.forEach(item => {
      if (item.properties.center)
        // console.log(item.properties.center[0])
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(item.properties.center[0], item.properties.center[1]), // 上海的经纬度
          label: {
            text: item.properties.name,
            font: '24px Helvetica',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });
    });



    // 添加第三方图层
    const ChinaMap = viewer.dataSources.add(Cesium.GeoJsonDataSource.load("../public/tst.json", {
      fill: Cesium.Color.fromCssColorString('#00868B'),
      stroke: Cesium.Color.fromCssColorString('#FFDEAD'),
      strokeWidth: 2,
    }))
    viewer.zoomTo(ChinaMap)







    console.log('模型加载完毕~~~')
    return () => {
      viewer.destroy()
    }
  }, [])

  return (
    <div className="container">
      <div className="hide">TEST</div>
      <div className="cesiumContainer" ref={cesiumContainerRef} />
    </div>
  )
}

export default CesiumMap;

