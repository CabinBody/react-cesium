import { getDataPrimitive,getProvinceList } from "./methodsRepo"

const loadResources = async () => {
    // 处理键盘按下事件
    const dataPrimitive = getDataPrimitive()
    // console.log(dataPrimitive.origin)
    const province = getProvinceList()

    await setTimeout(() => { }, 2000)

    return { dataPrimitive: dataPrimitive, province: province }
  }

  export default loadResources