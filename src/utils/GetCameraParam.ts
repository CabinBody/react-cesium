import {Cartographic,Math} from 'cesium'

function getCameraParameters(viewer:any) {

    var camera = viewer.camera;

    // 相机位置（Cartesian3 坐标）
    var position = camera.position;

    // 相机方向（Cartesian3 坐标）
    // var direction = camera.direction;

    // 相机向上方向（Cartesian3 坐标）
    // var up = camera.up;

    // 相机右方向（Cartesian3 坐标）
    // var right = camera.right;

    // 相机视场角
    // var frustum = camera.frustum;
    // var fov = Math.toDegrees(frustum.fovy); // 垂直视场角（以度为单位）

    // 将 Cartesian3 坐标转换为经纬度
    var cartographic = Cartographic.fromCartesian(position);
    var longitude = Math.toDegrees(cartographic.longitude);
    var latitude = Math.toDegrees(cartographic.latitude);
    var height = cartographic.height;

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