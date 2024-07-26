import {Cartographic,Math,Viewer} from 'cesium'

function getCameraParameters(viewer:Viewer) {

    let camera = viewer.camera;

    // 相机位置（Cartesian3 坐标）
    let position = camera.position;

    // 相机方向（Cartesian3 坐标）
    // let direction = camera.direction;

    // 相机向上方向（Cartesian3 坐标）
    // let up = camera.up;

    // 相机右方向（Cartesian3 坐标）
    // let right = camera.right;

    // 相机视场角
    // let frustum = camera.frustum;
    // let fov = Math.toDegrees(frustum.fovy); // 垂直视场角（以度为单位）

    // 将 Cartesian3 坐标转换为经纬度
    let cartographic = Cartographic.fromCartesian(position);
    let longitude = Math.toDegrees(cartographic.longitude);
    let latitude = Math.toDegrees(cartographic.latitude);
    let height = cartographic.height;

    // 打印相机参数
    // console.log('相机位置（Cartesian3 坐标）:', position);
    // console.log('相机方向:', direction);
    // console.log('相机向上方向:', up);
    // console.log('相机右方向:', right);
    // console.log('相机垂直视场角:', fov, '度');
    // console.log('相机经度:', longitude, '度');
    // console.log('相机纬度:', latitude, '度');
    // console.log('相机高度:', height, '米');

    return ({height,longitude,latitude})
}

export default getCameraParameters