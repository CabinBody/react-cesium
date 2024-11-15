import './index.less'
import vedioDemo from '/assets/WX20240925-155702@2x.png'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store'

const VideoMonitor: React.FC = () => {
    const {entityInfo} = useSelector((state: RootState) => state.onLeftClickTarget)

    return (
        <div>
            <div className='videoMonitor_container'>
                <div className="dot_img"></div>
                <span>实时监控画面</span>
                <div className="click_more">查看更多</div>
            </div>
            <div className="videoMonitor_screen">
                {entityInfo?.type=='UAV' && <img src={vedioDemo} alt="" style={{width:'13.5vw',height:'20vh'}}/>}
                {entityInfo?.type!='UAV' && <div id='videoMonitor_screen_text'>请点击需要监控的飞机</div>}

            </div>
        </div>
    )
}

export default VideoMonitor