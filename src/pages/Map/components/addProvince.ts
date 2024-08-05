import {Viewer, Cartesian3, Color, LabelStyle, NearFarScalar, VerticalOrigin } from "cesium";


const addProvince = (viewer: Viewer, province: any[],topContainerRef:any) => {
    province.forEach(item => {
        if (item.properties.centroid) {
            let entity = viewer.entities.add({
                position: Cartesian3.fromDegrees(item.properties.centroid[0], item.properties.centroid[1]),
                label: {
                    text: item.properties.name,
                    font: '24px Helvetica',
                    fillColor: Color.WHITE,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    style: LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: VerticalOrigin.BOTTOM,
                    scaleByDistance: new NearFarScalar(1000.0, 3.0, 5000.0, 0.7),
                }
            });
            topContainerRef.current.push(entity)
        }
    });
}

export default addProvince;
