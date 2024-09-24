import * as Cesium from 'cesium'
import provincelist from '../../../../public/china.json'
import 'cesium/Widgets/widgets.css'


const switchProvinceView = (viewer: Cesium.Viewer, province: string, mediumContainerRef: any) => {

    fetch(`../../../../public/Province/${province}.json`).then(response => {
        if (!response.ok) {
            throw new Error('failed Loading')
        }
        return response.json()
    }).then((cityList) => {

        const dataC: any = cityList
        const dataP: any = provincelist

        const targetP = dataP.features.find((item: any) => item.properties.name == province)

        const provinceCenter = targetP.properties.centroid
        const targetC: any[] = dataC.features
        const cityInfoList: any[] = targetC.map((item: any) => ({
            name: item.properties.name,
            center: item.properties.centroid ? item.properties.centroid : item.properties.center
        }))


        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1050000;//相机的高度的最小值 
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 3150000;//最大值

        if (province == '北京市'
            || province == '上海市'
            || province == '天津市'
            || province == '香港特别行政区'
            || province == '台湾省'
            || province == '澳门特别行政区') {
            viewer.scene.screenSpaceCameraController.minimumZoomDistance = 340000;//相机的高度的最小值 
            viewer.scene.screenSpaceCameraController.maximumZoomDistance = 460000;//最大值
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(provinceCenter[0], provinceCenter[1], 330000),
                orientation: {
                    heading: Cesium.Math.toRadians(0), // 水平方向角度
                    pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
                    roll: 0.0 // 滚动角度
                },
                duration: 1
            })
        }
        else {
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(provinceCenter[0], provinceCenter[1], 2000000),
                orientation: {
                    heading: Cesium.Math.toRadians(0), // 水平方向角度
                    pitch: Cesium.Math.toRadians(-90.0), // 垂直方向角度
                    roll: 0.0 // 滚动角度
                },
                duration: 1
            })
        }

        // 生成城市实体
        const proviceSlice = new Cesium.GeoJsonDataSource(province)
        proviceSlice.load(`../../../../public/Province/${province}.json`, {
            fill: Cesium.Color.fromCssColorString('#00868B').withAlpha(0.3),
            stroke: Cesium.Color.fromCssColorString('#FFDEAD'),
            strokeWidth: 2,
        })
        viewer.dataSources.add(proviceSlice)
        
        // console.log(proviceSlice)
        mediumContainerRef.current.push(proviceSlice)

        // 生成城市名称
        cityInfoList.forEach(item => {
            if (item) {
                // console.log(item)
                let singleEntity = viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(item.center[0], item.center[1]),
                    label: {
                        text: item.name,
                        font: '20px Helvetica',
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        scaleByDistance: new Cesium.NearFarScalar(1000.0, 3.0, 5000.0, 0.7),
                    }
                });
                // console.log(singleEntity)
                mediumContainerRef.current.push(singleEntity)
            }
        });
    })

}

export default switchProvinceView