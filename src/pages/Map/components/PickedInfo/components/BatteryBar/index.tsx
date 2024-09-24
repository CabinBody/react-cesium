import React from 'react';

interface BatteryProps {
    percentage: number;
}

const BatteryBar: React.FC<BatteryProps> = ({ percentage }) => {
    const batteryWidth = 40; // 电池宽度
    const batteryHeight = 15; // 电池高度
    const terminalWidth = 2; // 电池顶部的接头宽度
    const terminalHeight = 10; // 电池顶部的接头高度

    // 计算电池内部的填充宽度
    const fillWidth = (percentage / 100) * (batteryWidth - terminalWidth);

    // 根据电量百分比设置填充颜色
    const fillColor = '#e26441'

    return (
        <svg width={batteryWidth + terminalWidth} height={batteryHeight}>

            <rect
                x={0}
                y={0}
                width={batteryWidth - terminalWidth}
                height={batteryHeight}
                fill="#2b7c8b" // 电池外框颜色
                rx="5" // 圆角
                ry="5"
            />
            <rect
                x={0}
                y={0}
                width={fillWidth}
                height={batteryHeight}
                fill={fillColor} // 根据电量设置填充颜色
                rx="5"
                ry="5"
            />
            <rect
                x={batteryWidth-2}
                y={(batteryHeight - terminalHeight) / 2}
                width={terminalWidth}
                height={terminalHeight}
                fill="#e26441" // 电池接头颜色
                rx="2"
                ry="2"
            />
        </svg>
    );
};

export default BatteryBar;