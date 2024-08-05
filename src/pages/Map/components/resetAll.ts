import * as Cesium from 'cesium'
import viewerInitial from './viewerInitial'



const resetAll = (viewer: Cesium.Viewer, topContainerRef: any, mediumContainerRef: any) => {
    viewer.entities.removeAll()
    viewer.dataSources.removeAll()
    mediumContainerRef.current = []
    viewerInitial(viewer,topContainerRef)
    topContainerRef.current.forEach((item: any) => {
        item.show = true
    })

}

export default resetAll