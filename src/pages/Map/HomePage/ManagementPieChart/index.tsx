import ReactECharts from 'echarts-for-react';
import './index.less'
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';


const ManagementPieChart: React.FC = () => {
    const option = {
        backgroundColor: 'transparent',

        legend: {
            top: 'bottom',
            textStyle: {
                color: '#ffffff' // 设置图例文字颜色为白色
            },
        },

        tooltip: {
            trigger: 'item'
        },

        visualMap: {
            show: false,
            min: 40,
            max: 500,
            inRange: {
                colorLightness: [0, 1]
            }
        },
        series: [
            {
                name: '无人机运行实况',
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                data: [
                    { value: 250, name: '正常运行' },
                    { value: 222, name: '待机' },
                    { value: 100, name: '飞行异常' },
                    { value: 123, name: '黑飞' },
                    { value: 144, name: '未知' }
                ].sort(function (a, b) {
                    return b.value - a.value;
                }),
                roseType: 'radius',
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
                itemStyle: {
                    color: 'rgb(26, 151, 193)',
                    shadowBlur: 200,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },

                animationType: 'scale',
                animationEasing: 'elasticOut',
                // animationDelay: function (idx: any) {
                //     return Math.random() * 200;
                // }
            }
        ]
    };

    return <div>
        <div className='management_container'>
            <div className="dot_img"></div>
            <span>无人机运行情况统计</span>
            <div className="click_more">查看更多</div>
        </div>
        <ReactECharts option={option} style={{ height: '300px', width: '300px' }} />
    </div>

}

export default ManagementPieChart

