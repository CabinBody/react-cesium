import { useEffect, useRef } from 'react';
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
import virtualData from '../../../../public/virtual_UAV_DataPoint.json'

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

    const findByProvince = (data: any, value: string, key: string): any | undefined => {
        return data.find((item:any) => item[key] == value)
    }

    useEffect(() => {
        // if (chartRef) {
        //     console.log(chartRef)
        // }
        const ROOT_PATH = '/Province/';
        const chartDom = document.getElementById('DensityMap');
        const myChart = echarts.init(chartDom);
        const data: any = virtualData
        let mapData: any
        if (findByProvince(data,props.province,'province')) {
            mapData = Object.entries(findByProvince(data,props.province,'province').city).map((target:any) => ({
                name: target[1].city_name,
                value: target[1].city_count
            }));
        }
        else mapData = []
        // myChart.showLoading();
        fetch(ROOT_PATH + `${props.province}.json`)
            .then((response) => response.json())
            .then((geoJson) => {
                // myChart.hideLoading();
                echarts.registerMap(props.province, geoJson);

                const option = {
                    title: {
                        text: '',
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: (params: any) => {
                            return params.name + '<br/>' + (params.value ? params.value : 0) + '架'
                        }
                    },
                    visualMap: {
                        textStyle: {
                            color: '#B8F8F1'
                        },
                        left: 'right',
                        min: 0,
                        max: 200,
                        text: ['600', '0'],
                        realtime: false,
                        calculable: true,

                        inRange: {
                            color: ['#B8F8F1', '#073E59']
                        },
                        show: "ture",
                        position: 'right'
                    },
                    series: [
                        {
                            name: props.province,
                            type: 'map',
                            map: props.province,
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

    }, [props.province]);

    return <div id="DensityMap" ref={chartRef} style={{ width: '600px', height: '600px' }} />;
};

export default DensityMap;
