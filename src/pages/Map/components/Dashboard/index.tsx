import './index.less'
import DashboardSvg from './DashboardSvg'


const Dashboard: React.FC = () => {
    const velocity = 150

    return (
        <div className='dashboard_container'>
            <DashboardSvg velocity={velocity}></DashboardSvg>
            <div className='dashboard_velocity'>
                <div className='dashboard_show_velocity'>
                    <div className='dashboard_velocity_num'>{velocity}</div>
                    <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.3)' }}>KM</div>
                </div>
                <div className='dashboard_fly_velocity'>飞行速度</div>
                <div className='dashboard_fly_velocity' style={{ color: 'orange' }}>Normal</div>
            </div>
            <div className='dashboard_signal'>
                <div className='dashboard_signal_img'></div>
                <div className='dashboard_signal_img'></div>
            </div>

            <div className='dashboard_wrap'>
                <div className='dashboard_top_data'>
                    <div className='dashboard_top_wrap'>
                        <span className='dashboard_title'>300M</span>
                        <div className='dashboard_data_wrap'>
                            <div id='dashboard_height_img'></div>
                            <div>
                                <div className='dashboard_sub_cn'>飞行高度</div>
                                <div className='dashboard_sub_en'>Flight Altitude</div>
                            </div>
                        </div>
                    </div>
                    <div className='divide_line'></div>
                    <div className='dashboard_top_wrap'>
                        <span className='dashboard_title'>2.441 &deg;</span>
                        <div className='dashboard_data_wrap'>
                            <div id='dashboard_pitch_angle_img'></div>
                            <div>
                                <div className='dashboard_sub_cn'>俯仰角</div>
                                <div className='dashboard_sub_en'>Pitch Angle</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='dashboard_bottom'>
                    <div className='dashboard_bottom_img'>H</div>
                    <div className='dashboard_bottom_num'>历史累计里程: 20000 KM</div>
                </div>
                <div className='dashboard_bottom'>
                    <div className='dashboard_bottom_img'>R</div>
                    <div className='dashboard_bottom_num'>传感器类型: 激光雷达</div>
                </div>
            </div>


        </div>
    )
}

export default Dashboard
