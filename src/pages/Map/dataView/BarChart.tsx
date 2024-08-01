import ReactECharts from 'echarts-for-react';
import virtualData from '../../../../public/virtual_UAV_DataPoint.json'


type ChartPoint = {
    name:string
    value:number
}

const setData: any = virtualData

const chartData: ChartPoint[] = Object.entries(setData).map((target: any) => ({
    name: target[1].province,
    value: target[1].province_count
}));
// console.log(chartData)

chartData.sort((b, a) => b.value - a.value)
// console.log(province)

const ydata:string[] = chartData.map((item: any) => item.name)
const xdata:number[]= chartData.map((item: any) => item.value)



const BarChart = () => {

    const option = {
        title: {
            text: ' ',
            textStyle: {
                color: '#ffffff' // 设置标题颜色为白色
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            textStyle: {
                color: '#ffffff' // 设置图例文字颜色为白色
            }
        },
        grid: {
            left: '1%', // 增加左侧边距
            right: '2%', // 增加右侧边距
            bottom: '0%', // 增加底部边距
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.1],
            axisLabel: {
                color: '#ffffff' // 设置 x 轴标签颜色为白色
            },
            axisLine: {
                lineStyle: {
                    color: '#ffffff' // 设置 x 轴线颜色为白色
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#ffffff' // 设置分隔线颜色为白色
                }
            }
        },
        yAxis: {
            type: 'category',
            data: ydata,
            axisLabel: {
                color: '#ffffff' // 设置 y 轴标签颜色为白色
            },
            axisLine: {
                lineStyle: {
                    color: '#ffffff' // 设置 y 轴线颜色为白色
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#ffffff' // 设置分隔线颜色为白色
                }
            },
            barCategoryGap: '40%' // 设置条形图之间的间距
        },
        series: [
            {
                type: 'bar',
                data: xdata,
                barWidth: '50%', // 设置条形图的宽度
                itemStyle: {
                    color: '#073E59 ' // 设置条形图的颜色
                },
                // 控制条形图之间的间距
                barCategoryGap: '40%' // 设置条形图之间的间距
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '800px', width: '100%' }} />
};

export default BarChart;
