import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    VisualMapComponent,
    GeoComponent
} from 'echarts/components';
import { MapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import cityCount from '../../../../public/province_city_counts.json'

echarts.use([
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    VisualMapComponent,
    GeoComponent,
    MapChart,
    CanvasRenderer
]);

const DensityMap = (props: { province: string }) => {

    const chartRef = useRef(null);
    const [state,setState] = useState('')
    // console.log(state)

    useEffect(() => {
        setState(props.province)
        const ROOT_PATH = '/public/Province/';
        const chartDom = document.getElementById('main');
        const myChart = echarts.init(chartDom);
        const data: any = cityCount
        const mapData = Object.entries(data[props.province].cities).map(([key, value]) => ({
            name: key,
            value: value
        }));
        // console.log(mapData)


        myChart.showLoading();

        fetch(ROOT_PATH + `${props.province}.json`)
            .then((response) => response.json())
            .then((geoJson) => {
                myChart.hideLoading();
                echarts.registerMap('HK', geoJson);

                const option = {
                    title: {
                        text: '',
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}<br/>{c} (p / km2)'
                    },
                    visualMap: {
                        min: 0,
                        max: 100,
                        text: ['High', 'Low'],
                        realtime: false,
                        calculable: false,

                        inRange: {
                            color: ['#B8F8F1', '#073E59']
                        },
                        show: false
                    },
                    series: [
                        {
                            name: props.province,
                            type: 'map',
                            map: 'HK',
                            label: {
                                show: false
                            },
                            data: mapData
                        }
                    ]
                };

                myChart.setOption(option);
            });
        return () => {
            if (myChart) {
                myChart.dispose();
            }
        };

    }, [state]);

    return <div id="main" ref={chartRef} style={{ width: '600px', height: '600px' }} />;
};

export default DensityMap;
