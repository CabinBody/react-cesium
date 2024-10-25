import { useState } from 'react'
import './index.less'
import CurrentTime from './CurrentTime'
import { RootDispatch, RootState } from '../../../store'
import { useDispatch, useSelector } from 'react-redux'
import { setPage } from '../../../store/modules/pageSwitchReducer'

interface NavigatorProps {
    currentState: string
}


const Navigator: React.FC<NavigatorProps> = ({ currentState }) => {
    const { pageName } = useSelector((state: RootState) => state.pageSwitch)
    // 申明dispatch
    const dispatch: RootDispatch = useDispatch()

    const navItem = ['首页', '航线分析', '空域管理', '区域态势']

    const clickChange = (item: string) => {
        dispatch(setPage(item))
    }


    return (
        <div className='container_nav'>
            <div className='nav_title'>
                <div className='title_main'>
                    <div className='title_text'>泛在低空数智平台</div>
                    <div className='title_box'>Beta</div>
                </div>
                <div className='title_sub'>
                    Low-Altitude UAV Smart Platform
                </div>
            </div>
            {currentState !== 'BOTTOM' && <div  className='nav_prompt'></div>}
            {currentState === 'BOTTOM' && <div className='nav_switch'>
                {navItem.map((item) => (
                    <div
                        key={item}
                        onClick={() => { clickChange(item) }}
                        className={`nav_title ${item == pageName ? 'active' : ''}`}>
                        {`${item == pageName ? `[ ${item} ]` : item}`}
                    </div>
                ))}
            </div>}
            <div className='nav_more_info'>
                <div className='whether_bar'>
                    <div className='whether_img'></div>
                    <div className='whether_info'>
                        <div className='temperature'>
                            <div className='temperature_number'>32</div>
                            <div className='temperature_sign'>°C</div>
                        </div>
                        <div className='pm_number'>PM2.0</div>
                    </div>
                </div>
                <div className='current_time'>
                    <CurrentTime></CurrentTime>
                </div>
            </div>
        </div>
    )
}

export default Navigator