import { useEffect, useState } from "react";

interface DashBoardProps {
    velocity: number
}


const DashboardSvg: React.FC<DashBoardProps> = ({ velocity }) => {
    const bigCircleCenter = 250;
    const smallCircleCenter = 130;

    const radius = 100; // 半径
    const circumference = 2 * Math.PI * radius; // 圆周长
    const strokeChange = 2 * Math.PI * 120;
    const [offset, setOffset] = useState(circumference); // 初始偏移量为圆周长

    useEffect(() => {
        // 计算偏移量
        const offsetValue = circumference - (velocity / 250) * circumference;
        setOffset(offsetValue);
    }, [velocity, circumference]);



    return (
        <div>
            <svg width="350" height="300" xmlns="http://www.w3.org/2000/svg" >

                <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="orange" />
                        <stop offset="100%" stopColor="#28bd32" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* <!-- 圆形仪表盘 --> */}
                <circle
                transform="translate(-70,-80)"
                    cx="250"
                    cy="250"
                    rx="25"
                    ry="25"
                    r={radius}
                    stroke="url(#progress-gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }} // 添加过渡效果
                    filter="url(#glow)"
                    
                />
                {/* 外圈 */}
                <circle
                transform="translate(-70,-80)"
                    cx="250"
                    cy="250"
                    r="120"
                    rx="25"
                    ry="25"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={strokeChange}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }} // 添加过渡效果
                />
                <circle transform="translate(-70,-80)" cx={bigCircleCenter} cy={bigCircleCenter} r="120" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="transparent" />

                {/* 里圈 */}

                {/* 绘制三角形 */}
                <path
                transform="translate(-70,-80)"
                    d="
                    M 225 200        
                    L 200 190          
                    A 50 50 0 0 1 230 175  
                    Z               
                    "
                    fill="#474747"
                    stroke="transparent"
                    strokeWidth="2"
                />
                <path
                
                    d="
                    M 225 200        
                    L 200 190          
                    A 50 50 0 0 1 230 175  
                    Z               
                    "
                    fill="#474747"
                    stroke="transparent"
                    strokeWidth="2"
                    transform="rotate(180,180,170),translate(-70,-80)"
                />
                <circle transform="translate(-70,-80)" cx={bigCircleCenter} cy={bigCircleCenter} r="80" stroke="#474747" strokeWidth="7" fill="transparent" />

                {/* <!-- 左上角的状态圆 --> */}
                <circle transform="translate(-70,-80)" cx={smallCircleCenter} cy={smallCircleCenter} r="25" fill='transparent' stroke="white" strokeWidth="3" />
                <circle transform="translate(-70,-80)" cx={smallCircleCenter} cy={smallCircleCenter} r="35" fill='transparent' stroke="#474747" strokeDasharray='25,25' strokeWidth="1" />


            </svg>
        </div >
    )
}

export default DashboardSvg