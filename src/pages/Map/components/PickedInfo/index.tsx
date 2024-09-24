import './index.less'
import CircularProgressBar from './components/CircularProgressBar'
import BatteryBar from './components/BatteryBar'

const PickedInfo: React.FC = () => {


    return (
        <div className="container">
            <div className='outside_frame'>
                <div className='progress_bar'>
                    <div className='progress'>
                        <CircularProgressBar percentage={20}></CircularProgressBar>
                    </div>
                    <span className='position'>40N-116E</span>
                </div>
                <div className='info_bar'>
                    <div className='flight_info'>
                        <div className='flight_time'>
                            <span style={{ fontSize: '13px' }}>北京昌平</span>
                            <span>13:00</span>
                        </div>
                        <div className='arrow'></div>
                        <div className='flight_time'>
                            <span style={{ fontSize: '13px' }}>北京延庆</span>
                            <span>13:00</span>
                        </div>
                        <div className='battery'>
                            <div className='battery_svg'>
                            <BatteryBar percentage={80}></BatteryBar>
                            </div>
                            <div className='battery_text'>80%</div>
                        </div>
                    </div>
                    <div className='uav_id'>UAV-QDI88Q</div>
                    <div className='more_info'>
                        <div className='info_list'>
                            <div className='info_show'>
                                <span>运输负载:</span>
                                <span className='info_data'>5kg</span>
                            </div>
                            <div className='info_show'>
                                <span>所属单位:</span>
                                <span className='info_data'>中国邮政</span>
                            </div>
                        </div>
                        <div className='info_list'>
                            <div className='info_show'>
                                <span>飞行航程:</span>
                                <span className='info_data'>18km</span>
                            </div>
                            <div className='info_show'>
                                <span>预计耗时:</span>
                                <span className='info_data'>40min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PickedInfo