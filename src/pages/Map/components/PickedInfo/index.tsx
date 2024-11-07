import './index.less'
import CircularProgressBar from './components/CircularProgressBar'
import BatteryBar from './components/BatteryBar'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store'
interface PickedInfoProps {
    informMessage: (id: string, message: string) => void
}

const PickedInfo: React.FC<PickedInfoProps> = ({ informMessage }) => {
    const { entityInfo } = useSelector((state: RootState) => state.onLeftClickTarget)

    const [uavInfo, setUavInfo] = useState({
        uavId: 'UAV-QDI88Q',
        progress: 0,
        position: `40N-116E`,
        from: '北京昌平',
        to: '北京延庆',
        flightTime: '16:00-16:40',
        battery: 80,
        load: '5',
        distance: '18',
        duration: '40'
    })

    const dataUpdate = setInterval(() => {
        if (uavInfo.progress == 100) {
            clearInterval(dataUpdate)
            return
        }
        setUavInfo((item => ({
            ...item, progress: item.progress + 5
        })))

    }, 3000);

    return (
        <div className="pickedInfo_container">
            <div className='pickedInfo_outside_frame'>
                <div className='pickedInfo_progress_bar'>
                    <div className='progress'>
                        <CircularProgressBar percentage={20}></CircularProgressBar>
                    </div>
                    <span className='position'>{entityInfo?.latitude?.toFixed(2)}N-{entityInfo?.longitude?.toFixed(2)}E</span>
                </div>
                <div className='pickedInfo_info_bar'>
                    <div className='flight_info'>
                        <div className='flight_time'>
                            <span style={{ fontSize: '13px' }}>{uavInfo.from}</span>
                            <span>16:00</span>
                        </div>
                        <div className='arrow'></div>
                        <div className='flight_time'>
                            <span style={{ fontSize: '13px' }}>{uavInfo.to}</span>
                            <span>16:40</span>
                        </div>
                        <div className='battery'>
                            <div className='battery_svg'>
                                <BatteryBar percentage={uavInfo.battery}></BatteryBar>
                            </div>
                            <div className='battery_text'>{uavInfo.battery}%</div>
                        </div>
                    </div>
                    <div className='uav_id'>{entityInfo?.id}</div>
                    <div className='more_info'>
                        <div className='info_list'>
                            <div className='info_show'>
                                <span>运输负载:</span>
                                <span className='info_data'>{uavInfo.load}kg</span>
                            </div>
                            <div className='info_show'>
                                <span>所属单位:</span>
                                <span className='info_data'>中国邮政</span>
                            </div>
                        </div>
                        <div className='info_list'>
                            <div className='info_show'>
                                <span>飞行航程:</span>
                                <span className='info_data'>{uavInfo.distance}km</span>
                            </div>
                            <div className='info_show'>
                                <span>预计耗时:</span>
                                <span className='info_data'>{uavInfo.duration}min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='pickedInfo_control_bar'>
                <span>控制策略</span>
                <button className='pickedInfo_control_btn' onClick={() => { informMessage(`${entityInfo?.id ? entityInfo.id : ''}`,'遣返') }}>遣返</button>
                <button className='pickedInfo_control_btn' onClick={() => { informMessage(`${entityInfo?.id ? entityInfo.id : ''}`,'迫降') }}>迫降</button>
            </div>
        </div>
    )
}
export default PickedInfo