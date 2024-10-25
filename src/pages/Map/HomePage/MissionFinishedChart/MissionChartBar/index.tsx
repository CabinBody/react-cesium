import { useState } from 'react';
import './index.less'

interface MissionChartBarProps {
    value: number;
    maxValue: number;
    month:number;
}

const MissionChartBar: React.FC<MissionChartBarProps> = ({ value, maxValue ,month}) => {

    const [fillHeight,setFillHeight]= useState(0)

    const barHeight =200; // 长方形总高度
    const barWidth = 16; // 长方形宽度
    const whiteBackWidth = 50 //白色背景宽度
    const thinStripHeight = 3; // 顶部窄条高度
    const heightRatio = value / maxValue; // 计算长方形的相对高度
    let fillYPosition = barHeight - fillHeight + thinStripHeight+30; // 让填充从底部开始
    const bottomLineHeight = 2

    setTimeout(() => {
        setFillHeight(barHeight * heightRatio); 
    }, 100);


    return (
        <div className='missionChartBar_container'>
            <svg width={whiteBackWidth} height={barHeight+40} > {/* 加40用于数值显示 */}
                {/* 顶部亮蓝色窄条 */}
                <rect className='mission_bar_animate'
                    x="12"
                    y={fillYPosition - thinStripHeight}
                    width={barWidth}
                    height={thinStripHeight}
                    fill="deepskyblue"
                />

                {/* 定义渐变 */}
                <defs>
                    {/* 渐变长方形颜色 */}
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#177DDC', stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: '#177DDC', stopOpacity: 1 }} />
                    </linearGradient>

                    {/* 底部白色渐变背景 */}
                    <linearGradient id="whiteGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(27, 126, 207,0.9)', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>

                {/* 显示数值 */}
                <text
                    className='fadeIn_text'
                    x={20}
                    y={fillYPosition - thinStripHeight - 8}
                    fontSize="12"
                    textAnchor="middle"
                    fill="white"
                >
                    {value}
                </text>

                {/* 渐变颜色的长方形，从底部往上 */}
                <rect className='mission_bar_animate'
                    x="12"
                    y={fillYPosition} // 让它从底部往上增长
                    width={barWidth}
                    height={fillHeight}
                    fill="url(#blueGradient)"
                />

                {/* 底部白色渐变背景 */}
                <rect
                    x="0"
                    y={thinStripHeight+30}
                    width={whiteBackWidth}
                    height={barHeight}
                    fill="url(#whiteGradient)"
                />
                <rect
                    x="0"
                    y={barHeight + thinStripHeight+30}
                    width={whiteBackWidth}
                    height={bottomLineHeight}
                    fill="rgba(234, 234, 234, 0.3)"
                />
            </svg>
            <div className='mission_subtitle_month'>{month}月</div>
        </div>


    )
}

export default MissionChartBar