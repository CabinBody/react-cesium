import { LabelCollection, Viewer, Cartesian3, Color, LabelStyle, NearFarScalar, VerticalOrigin } from "cesium";


const addProvince = (viewer: Viewer, province: any[]) => {
    const labels = new LabelCollection();
    viewer.scene.primitives.add(labels);
    province.forEach(item => {
        if (item.properties.centroid) {
            labels.add({
                position: Cartesian3.fromDegrees(item.properties.centroid[0], item.properties.centroid[1]), 
                text: item.properties.name,
                font: '24px Helvetica',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                style: LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: VerticalOrigin.BOTTOM,
                scaleByDistance: new NearFarScalar(1000.0, 3.0, 5000.0, 0.7),

            });
        }
    });
}

export default addProvince;
