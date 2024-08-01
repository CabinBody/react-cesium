import { Viewer,LabelCollection } from 'cesium'
import viewerInitial from './viewerInitial'

const resetAll = (viewer: Viewer) => {
    viewer.dataSources.removeAll()
    viewer.entities.removeAll()

    viewerInitial(viewer)
}

export default resetAll