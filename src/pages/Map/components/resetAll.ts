import * as Cesium from 'cesium'
import 'cesium/Widgets/widgets.css'
import viewerInitial from './viewerInitial'



const resetAll = (viewer: Cesium.Viewer, topContainerRef: any, mediumContainerRef: any,bottomContainerRef:any) => {
    viewer.entities.removeAll()
    viewer.dataSources.removeAll()
    mediumContainerRef.current = []
    bottomContainerRef.current = []
    viewerInitial(viewer,topContainerRef)
    topContainerRef.current.forEach((item: any) => {
        item.show = true
    })

}

export default resetAll