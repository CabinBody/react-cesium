import './index.less'
import MissionChartBar from './MissionChartBar'

const MissionFinishedChart: React.FC = () => {
    const missionList = [
        {
            index:1,
            month:6,
            value:187,
        },
        {
            index:2,
            month:7,
            value:240,
        },
        {
            index:3,
            month:8,
            value:350,
        },
        {
            index:4,
            month:9,
            value:380,
        },
        {
            index:5,
            month:10,
            value:360,
        },
        {
            index:6,
            month:11,
            value:250,
        },
        {
            index:7,
            month:12,
            value:120,
        },
    ]

    return (
        <div>
            <div className='mission_container'>
                <div className="dot_img"></div>
                <span>任务完成情况</span>
                <div className="click_more">查看更多</div>
            </div>
            <div className='mission_list_show'>
                {missionList.map((item)=>(
                    <div key={item.index}>
                        <MissionChartBar value={item.value} maxValue={400} month={item.month}></MissionChartBar>
                    </div>
                ))}
            </div>
            <div style={{textAlign:'center', width:'13.5vw',color:'rgba(225, 225, 225,0.3)',fontSize:'12px'}}>单位/次</div>
        </div>
    )
}

export default MissionFinishedChart