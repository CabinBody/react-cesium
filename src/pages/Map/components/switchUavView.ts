import { Point } from "../../../global-env"
import * as Cesium from 'cesium'

const switchUavView = async (viewer: Cesium.Viewer, currentData: Point) => {
    let uav = viewer.entities.getById(currentData.id.toString())
    if (uav) {
        await viewer.flyTo(uav, {
            duration: 2
            // maximumHeight: 2000,
        })
    }
    // addWorldTerrainAsync(viewer)
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 10000;//相机高度的最大值
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;//相机的高度的最小值

    viewer.scene.screenSpaceCameraController.enableLook = true; // 禁用视角调整
    viewer.scene.screenSpaceCameraController.enableTilt = true; // 禁用倾斜  

}


export default switchUavView