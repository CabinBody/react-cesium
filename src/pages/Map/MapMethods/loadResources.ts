import {getProvinceList,getUavCountList } from "./methodsRepo"


const loadResources = () => {

    const province = getProvinceList()

    const uavCountList = getUavCountList()

    return { province: province,uavCountList:uavCountList}
  }

  export default loadResources