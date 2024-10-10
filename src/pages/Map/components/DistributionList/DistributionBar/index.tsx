import { useState } from 'react';
import './index.less'

interface ChartValue {
    index: number;
    value: number;
    areaName: string;
}

const DistributionBar: React.FC<ChartValue> = ({ index, value, areaName }) => {

    const [widthPercentage,setWidthPercentage] = useState(0)

    const maxValue = 200;
    const width = '400'
    const height = '10'

    setTimeout(() => {
        setWidthPercentage((value / maxValue) * 100)
    }, 100);

    return (
        <div >
            <div className='disbar_info'>
                <div style={{ fontWeight: "bold" }}>{`${index > 9 ? '' : '0'}` + index}&nbsp;</div>                <div>{areaName}</div>
                <div className='bar_value' style={{ fontWeight: "bold" }}>{value}</div>
            </div>
            <div className='bar_svg'>
                <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" >
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "rgb(10, 109, 176)", stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: "rgb(10, 168, 176)", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>

                    {/* 背景条 */}
                    <rect width={width} height={height} fill="rgba(48, 75, 90,0.4)" />

                    {/* 动态宽度的前景条 */}
                    <rect className='progress_bar'
                        width={`${widthPercentage}%`} height={height} fill="url(#grad1)" />

                    {/* 边框 */}
                    <rect width={width} height={height} fill="none" stroke="rgba(99, 99, 99,0.2)" />
                </svg>
            </div>
        </div>
    );
}

export default DistributionBar