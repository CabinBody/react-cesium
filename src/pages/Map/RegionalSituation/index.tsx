import './index.less'
interface ReginonalProps {
    switchLayer: () => void
    clickRegionalButton: (message: string) => void
}

const RegionalSituation: React.FC<ReginonalProps> = ({ switchLayer, clickRegionalButton }) => {
    const regionalButtonList = [
        { title: '降雨降水', img: '/assets/regional_img/rain.png' },
        { title: '风速风力', img: '/assets/regional_img/wind.png' },
        { title: '地貌地势', img: '/assets/regional_img/hill.png' },
        { title: '运力分布', img: '/assets/regional_img/uav.png' },
        { title: '通信质量', img: '/assets/regional_img/tele.png' },
        { title: '航线分布', img: '/assets/regional_img/nav.png' },
    ]
    return (
        <div className='regional_container'>
            <div className='regional_button_container'>
                {regionalButtonList.map((item, index) => (
                    <div className='Regional_button' key={index} onClick={() => { clickRegionalButton(item.title) }}>
                        <span>{item.title}<br />视图</span>
                        <img src={item.img} width='80' height='80' />
                    </div>
                ))}
                <div className='Regional_button' onClick={() => { clickRegionalButton('关闭所有视图') }}>
                    <span>关闭所有视图</span>
                </div>
            </div>
            <div className='regional_to_reality' onClick={switchLayer}>
                <img src="/assets/regional_img/goRight.png" alt="" width='80' height='80' />
            </div>
        </div>
    )
}
export default RegionalSituation;