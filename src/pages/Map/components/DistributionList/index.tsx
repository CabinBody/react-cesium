import DistributionBar from "./DistributionBar";
import './index.less'

const DistributionList: React.FC = () => {
    const list = [
        {
            index: 1,
            areaName: '昌平区',
            value: 190
        },
        {
            index: 2,
            areaName: '海淀区',
            value: 187
        },
        {
            index: 3,
            areaName: '延庆区',
            value: 149
        }, {
            index: 4,
            areaName: '密云区',
            value: 120
        }, {
            index: 5,
            areaName: '东城区',
            value: 117
        }, {
            index: 6,
            areaName: '丰台区',
            value: 89
        }, {
            index: 7,
            areaName: '房山区',
            value: 68
        }, {
            index: 8,
            areaName: '西城区',
            value: 40
        }, {
            index: 9,
            areaName: '大兴区',
            value: 20
        }, {
            index: 10,
            areaName: '石景山区',
            value: 10
        },

    ]

    return (
        <div>
            <div className='disbar_title'>
                <div className="dot_img"></div>
                <span>无人机分布情况</span>
                <div className="click_more">查看更多</div>
            </div>
            {list.map((item) => (
                <div key={item.index} className="distri_bar_item">
                    <DistributionBar index={item.index} areaName={item.areaName} value={item.value}></DistributionBar>
                </div>
            ))}
        </div>
    )
}

export default DistributionList