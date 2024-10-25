import { useState } from 'react';
import './index.less'; // 导入样式

interface FlightProps {
    handleClickFlightList: () => void;
}

const FlightRouteStatistics: React.FC<FlightProps> = ({handleClickFlightList}) => {

    
    const [sortMethod, setSortMethod] = useState('W'); // 排序方式
    // 模拟表格数据 (50条)
    const flightData = new Array(50).fill(0).map((_, index) => ({
        flightNumber: `U118YA`,
        time: '16:00',
        route: '昌平-怀柔',
        progress: index % 2 === 0 ? '100%' : '89%',
        status: index % 3 === 0 ? 'green' : index % 3 === 1 ? 'yellow' : 'red'
    }));

    const clickSortMethod = (method: string) => {
        setSortMethod(method);
    };

    return (
        <div className="flight-table">
            <div className='flight_table_nav'>
                <div className='flight_table_title'>
                    <img src="/src/asset/listimg2.png" alt="" width='30' height='30' />
                    <h2 style={{ color: 'white', marginLeft: '20px' }}>航线列表</h2>
                </div>
                <div className='flight_table_search'>
                    <img src="/src/asset/tabler_search.png" alt="" width='30' height='30' />
                    <input className='flight_table_search_input' type="text" placeholder='请输入航线代号' />
                </div>
                <div className='flight_table_sort'>
                    <h2 onClick={() => {clickSortMethod('D')}} className={`sortMethod ${sortMethod === 'D'? 'active' : ''}`}>D</h2>
                    <h2>/</h2>
                    <h2 onClick={() => {clickSortMethod('W')}} className={`sortMethod ${sortMethod === 'W'? 'active' : ''}`}>W</h2>
                    <h2>/</h2>
                    <h2 onClick={() => {clickSortMethod('M')}} className={`sortMethod ${sortMethod === 'M'? 'active' : ''}`}>M</h2>
                </div>
            </div>
            <div className='flight_table_firstline'>
                <h4>&nbsp;&nbsp;&nbsp;</h4>
                <h4>航线代号</h4>
                <h4 style={{ transform:'translateX(6px)' }}>计划</h4>
                <h4 style={{ transform:'translateX(25px)' }}>起点/终点</h4>
                <h4 style={{ transform:'translateX(28px)' }}>航线进程</h4>
                <h4 style={{ transform:'translateX(8px)' }}>状态</h4>
            </div> 
            <div className='flight_table_content'>
                <table>
                    <tbody>
                        {flightData.map((flight, index) => (
                            <tr onClick={handleClickFlightList} key={index} className={`status-${flight.status}`} >
                                <td>
                                    <img src="/src/asset/listimg.png" alt="" width="20" height='20' />
                                </td>
                                <td>{flight.flightNumber}</td>
                                <td>{flight.time}</td>
                                <td>{flight.route}</td>
                                <td>{flight.progress}</td>
                                <td>
                                    <span className={`status-indicator ${flight.status}`} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
export default FlightRouteStatistics;