import './index.less'
import vedioDemo from '../../../../asset/WX20240925-155702@2x.png'

const VideoMonitor: React.FC = () => {


    return (
        <div>
            <div className='videoMonitor_container'>
                <div className="dot_img"></div>
                <span>实时监控画面</span>
                <div className="click_more">查看更多</div>
            </div>
            <div className="videoMonitor_screen">
                <img src={vedioDemo} alt="" style={{width:'13.5vw',height:'20vh'}}/>
            </div>
        </div>
    )
}

export default VideoMonitor