import React from 'react'
import './index.less'

interface ReginonalProps {
    switchLayer: () => void
}

const RegionalSituation: React.FC<ReginonalProps> = ({switchLayer}) => {
    return (
        <div className='regional_container'>
            <div className='regional_button_container'>
                <div className='Regional_button'>
                    <span>降雨降水<br />视图</span>
                    <img src="/src/asset/regional_img/rain.png" alt="" width='80' height='80' />
                </div>
                <div className='Regional_button'>
                    <span>风速风力<br />视图</span>
                    <img src="/src/asset/regional_img/wind.png" alt="" width='80' height='80' />
                </div>
                <div className='Regional_button'>
                    <span>地貌地势<br />视图</span>
                    <img src="/src/asset/regional_img/hill.png" alt="" width='80' height='80' />
                </div>
                <div className='Regional_button'>
                    <span>运力分布<br />视图</span>
                    <img src="/src/asset/regional_img/uav.png" alt="" width='80' height='80' />
                </div>
                <div className='Regional_button'>
                    <span>通信质量<br />视图</span>
                    <img src="/src/asset/regional_img/tele.png" alt="" width='80' height='80' />
                </div>
                <div className='Regional_button'>
                    <span>航线分布<br />视图</span>
                    <img src="/src/asset/regional_img/nav.png" alt="" width='80' height='80' />
                </div>
                <div className='Regional_button'>
                    <span>关闭所有视图</span>
                </div>
            </div>
            <div className='regional_to_reality' onClick={switchLayer}>
                <img src="/src/asset/regional_img/goRight.png" alt="" width='80' height='80' />
            </div>
        </div>
    )
}
export default RegionalSituation;