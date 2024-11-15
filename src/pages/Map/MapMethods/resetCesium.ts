import * as Cesium from 'cesium'
import viewerInitial from './viewerInitial'



const resetCesium = (viewer: Cesium.Viewer, topContainerRef: any, mediumContainerRef: any,bottomContainerRef:any) => {
    viewer.entities.removeAll()
    viewer.dataSources.removeAll()
    mediumContainerRef.current = []
    bottomContainerRef.current = []
    viewerInitial(viewer,topContainerRef)
    topContainerRef.current.forEach((item: any) => {
        item.show = true
    })

}

export default resetCesium