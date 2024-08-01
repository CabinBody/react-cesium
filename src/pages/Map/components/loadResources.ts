import { getDataPrimitive,getProvinceList,getUavCountList } from "./methodsRepo"


const loadResources = () => {
    // 处理键盘按下事件

    // console.log(dataPrimitive.origin)
    const province = getProvinceList()

    const uavCountList = getUavCountList()

    return { province: province,uavCountList:uavCountList}
  }

  export default loadResources