import React from 'react';

interface CircularProgressBarProps {
    percentage: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage }) => {
    const radius = 50; // 圆的半径
    const strokeWidth = 15; // 圆的线宽
    const normalizedRadius = radius - strokeWidth / 2; // 归一化半径
    const circumference = normalizedRadius * 2 * Math.PI; // 圆周长
    const strokeDashoffset = circumference - (percentage / 100) * circumference; // 填充长度

    return (
        <svg height={radius * 2} width={radius * 2}>
            <defs>
                <linearGradient id="gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#f1b054', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ffeb3b', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <defs>
                <filter id="shadow" x="-10%" y="-10%" width="150%" height="150%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0" />
                    <feOffset dx="1" dy="1" result="offsetblur" />
                    {/* <feFlood flood-color="rgba(0,0,0,0.2)" /> */}
                    <feComposite in2="offsetblur" operator="in" />
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle
                stroke="#2b7c8b"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                filter="url(#shadow)"
            />
            <circle
                stroke="url(#gradient)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${radius} ${radius})`}
                style={{ transition: 'stroke-dashoffset 0.5s ease 0s' }}
            />
            <text
                x="50%"
                y="45%"
                alignmentBaseline="middle"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="16"
                fontWeight="bold"
            >
                {percentage}%
            </text>
            <text
                x="50%"
                y="60%"
                alignmentBaseline="middle"
                textAnchor="middle"
                fill="#d3d3d2"
                fontSize="8"
            >
                航程进度
            </text>
        </svg>
    );
};

export default CircularProgressBar;