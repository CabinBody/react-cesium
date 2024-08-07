import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
interface TestUAV {
    lo: number
    la: number
    ht: number
    type: 'Credible' | 'Faulty' | 'Unauthorized'
    hpr: Cesium.HeadingPitchRoll
}
const uavCredible: TestUAV = {
    lo: 115.99,
    la: 40.46,
    ht: 2000,
    type: 'Credible',
    hpr: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(135), 0, 0)
}
const uavFaulty: TestUAV = {
    lo: 115.77,
    la: 40.38,
    ht: 2000,
    type: 'Faulty',
    hpr: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0), 0, 0)
}
const uavUnauthorized: TestUAV = {
    lo: 115.86,
    la: 40.32,
    ht: 2000,
    type: 'Unauthorized',
    hpr: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-90), 0, 0)
}

const CrediblePaths = [
    [
        Cesium.Cartesian3.fromDegrees(115.99, 40.46, 2050),
        Cesium.Cartesian3.fromDegrees(115.90, 40.38, 2050),
        Cesium.Cartesian3.fromDegrees(115.68, 40.29, 2050),
    ],
    [
        Cesium.Cartesian3.fromDegrees(115.77, 40.38, 2050),
        Cesium.Cartesian3.fromDegrees(115.87, 40.43, 2050),
        Cesium.Cartesian3.fromDegrees(116.09, 40.43, 2050),
    ],
    [
        Cesium.Cartesian3.fromDegrees(115.86, 40.32, 2050),
        Cesium.Cartesian3.fromDegrees(115.94, 40.32, 2050),
        Cesium.Cartesian3.fromDegrees(115.92, 40.27, 2050),
    ],
]

const flightPaths = [
    [
        Cesium.Cartesian3.fromDegrees(115.99, 40.46, 2000),
        Cesium.Cartesian3.fromDegrees(115.90, 40.38, 2000),
        Cesium.Cartesian3.fromDegrees(115.68, 40.29, 2000),
    ],
    [
        Cesium.Cartesian3.fromDegrees(115.77, 40.38, 2000),
        Cesium.Cartesian3.fromDegrees(115.87, 40.43, 2000),
        Cesium.Cartesian3.fromDegrees(115.99, 40.53, 2000),
    ],
    [
        Cesium.Cartesian3.fromDegrees(115.86, 40.32, 2000),
        Cesium.Cartesian3.fromDegrees(115.94, 40.32, 2000),
        Cesium.Cartesian3.fromDegrees(115.92, 40.27, 2000),
    ],
]

const differentiatedDisplay = (viewer: Cesium.Viewer) => {
    if (viewer) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(115.99844304888984, 40.4690146212897, 56000)
        })
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 100000;//相机高度的最大值
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000;//相机的高度的最小值

        const startTime = Cesium.JulianDate.fromDate(new Date());
        const endTime = Cesium.JulianDate.addSeconds(startTime, 3600, new Cesium.JulianDate());

        const crediblePositionProperty = new Cesium.SampledPositionProperty();
        flightPaths[0].forEach((pos, index) => {
            const time = Cesium.JulianDate.addSeconds(startTime, index * 600, new Cesium.JulianDate());
            crediblePositionProperty.addSample(time, pos);
        });

        // 可信飞机
        viewer.entities.add({
            id: uavCredible.type,
            name: 'UAV',
            position: crediblePositionProperty,
            model: {
                uri: '../../../../public/UAV.glb',
                minimumPixelSize: 100,
                maximumScale: 20000
            },
            orientation: new Cesium.VelocityOrientationProperty(crediblePositionProperty),
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.GREEN,
                    dashLength: 60
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 600 // Show the path behind the entity
            },
        });

        // 预定轨迹
        viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => CrediblePaths[0], false),
                width: 8,
                material: Cesium.Color.GREEN,
                clampToGround: false
            }
        });
        viewer.entities.add({
            position: crediblePositionProperty,
            label: {
                text: 'Credible',
                font: '24px Helvetica',
                fillColor: Cesium.Color.GREEN,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 20,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40) // Offset the label above the entity
            }
        });



        const FaultyPositionProperty = new Cesium.SampledPositionProperty();
        flightPaths[1].forEach((pos, index) => {
            const time = Cesium.JulianDate.addSeconds(startTime, index * 600, new Cesium.JulianDate());
            FaultyPositionProperty.addSample(time, pos);
        });

        // 不可信飞机
        viewer.entities.add({
            id: uavFaulty.type,
            name: 'UAV',
            position: FaultyPositionProperty,
            model: {
                uri: '../../../../public/UAV.glb',
                minimumPixelSize: 100,
                maximumScale: 20000
            },
            orientation: new Cesium.VelocityOrientationProperty(FaultyPositionProperty),
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED,
                    dashLength: 80
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 600 // Show the path behind the entity
            },
        });

        // 预定轨迹
        viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => CrediblePaths[1], false),
                width: 8,
                material: Cesium.Color.GREEN,
                clampToGround: false
            }
        });
        viewer.entities.add({
            position: FaultyPositionProperty,
            label: {
                text: 'Faulty',
                font: '24px Helvetica',
                fillColor: Cesium.Color.BLUE,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 20,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40) // Offset the label above the entity
            }
        });


        const UnauthorizedPositionProperty = new Cesium.SampledPositionProperty();
        flightPaths[2].forEach((pos, index) => {
            const time = Cesium.JulianDate.addSeconds(startTime, index * 600, new Cesium.JulianDate());
            UnauthorizedPositionProperty.addSample(time, pos);
        });

        // 黑飞
        viewer.entities.add({
            id: uavUnauthorized.type,
            name: 'UAV',
            position: UnauthorizedPositionProperty,
            model: {
                uri: '../../../../public/UAV.glb',
                minimumPixelSize: 100,
                maximumScale: 20000
            },
            orientation: new Cesium.VelocityOrientationProperty(UnauthorizedPositionProperty),
            path: {
                resolution: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED,
                    dashLength: 80
                }),
                width: 3,
                leadTime: 0, // Show the path ahead of the entity
                trailTime: 3000 // Show the path behind the entity
            },
        });

        // 没有轨迹
        viewer.entities.add({
            position: UnauthorizedPositionProperty,
            label: {
                text: 'Unauthorized',
                font: '24px Helvetica',
                fillColor: Cesium.Color.RED,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 20,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40) // Offset the label above the entity
            }
        });


        viewer.clock.startTime = startTime;
        viewer.clock.stopTime = endTime;
        viewer.clock.currentTime = startTime.clone();
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
        viewer.clock.multiplier = 1;

    }
}

export default differentiatedDisplay;
