import { useState } from 'react';
import './index.less'; // 导入样式

interface FlightProps {
    handleClickFlightList: (flight_number: string) => void;
}

const FlightRouteStatistics: React.FC<FlightProps> = ({ handleClickFlightList }) => {


    const [sortMethod, setSortMethod] = useState('W'); // 排序方式
    const [searchValue, setSearchValue] = useState(''); // 搜索框内容
    // 模拟表格数据 (50条)
    const flightData = [
        {
            "flight_id": 16,
            "flight_number": "U00001",
            "flight_plan": "10月01日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 76,
            "flight_status": "yellow"
        },
        {
            "flight_id": 17,
            "flight_number": "U00002",
            "flight_plan": "10月02日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 77,
            "flight_status": "yellow"
        },
        {
            "flight_id": 18,
            "flight_number": "U00003",
            "flight_plan": "10月03日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 78,
            "flight_status": "yellow"
        },
        {
            "flight_id": 19,
            "flight_number": "U00004",
            "flight_plan": "10月04日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 79,
            "flight_status": "yellow"
        },
        {
            "flight_id": 20,
            "flight_number": "U00005",
            "flight_plan": "10月05日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 80,
            "flight_status": "yellow"
        },
        {
            "flight_id": 21,
            "flight_number": "U00006",
            "flight_plan": "10月06日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 81,
            "flight_status": "red"
        },
        {
            "flight_id": 22,
            "flight_number": "U00007",
            "flight_plan": "10月07日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 82,
            "flight_status": "yellow"
        },
        {
            "flight_id": 23,
            "flight_number": "U00008",
            "flight_plan": "10月08日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 83,
            "flight_status": "yellow"
        },
        {
            "flight_id": 24,
            "flight_number": "U00009",
            "flight_plan": "10月09日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 84,
            "flight_status": "yellow"
        },
        {
            "flight_id": 25,
            "flight_number": "U00010",
            "flight_plan": "10月10日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 85,
            "flight_status": "yellow"
        },
        {
            "flight_id": 26,
            "flight_number": "U00011",
            "flight_plan": "10月11日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 86,
            "flight_status": "yellow"
        },
        {
            "flight_id": 27,
            "flight_number": "U00012",
            "flight_plan": "10月12日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 100,
            "flight_status": "green"
        },
        {
            "flight_id": 28,
            "flight_number": "U00013",
            "flight_plan": "10月13日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 100,
            "flight_status": "green"
        },
        {
            "flight_id": 29,
            "flight_number": "U00014",
            "flight_plan": "10月14日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 89,
            "flight_status": "yellow"
        },
        {
            "flight_id": 30,
            "flight_number": "U00015",
            "flight_plan": "10月15日16:00",
            "flight_destination": "昌平-怀柔",
            "flight_progress": 90,
            "flight_status": "yellow"
        }
    ];


    const clickSortMethod = (method: string) => {
        setSortMethod(method);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const filterFlightData = flightData.filter(flight => flight.flight_number.toLowerCase().includes(searchValue.toLowerCase()))

    return (
        <div className="flight-table">
            <div className='flight_table_nav'>
                <div className='flight_table_title'>
                    <img src="/assets/listimg2.png" alt="" width='30' height='30' />
                    <h2 style={{ color: 'white', marginLeft: '20px' }}>航线列表</h2>
                </div>
                <div className='flight_table_search'>
                    <img src="/assets/tabler_search.png" alt="" width='30' height='30' />
                    <input className='flight_table_search_input' type="text" placeholder='请输入航线代号' onChange={handleSearchChange}/>
                </div>
                <div className='flight_table_sort'>
                    <h2 onClick={() => { clickSortMethod('D') }} className={`sortMethod ${sortMethod === 'D' ? 'active' : ''}`}>D</h2>
                    <h2>/</h2>
                    <h2 onClick={() => { clickSortMethod('W') }} className={`sortMethod ${sortMethod === 'W' ? 'active' : ''}`}>W</h2>
                    <h2>/</h2>
                    <h2 onClick={() => { clickSortMethod('M') }} className={`sortMethod ${sortMethod === 'M' ? 'active' : ''}`}>M</h2>
                </div>
            </div>
            <div className='flight_table_firstline'>
                <h4>&nbsp;&nbsp;&nbsp;</h4>
                <h4>航线代号</h4>
                <h4 style={{ transform: 'translateX(6px)' }}>计划</h4>
                <h4 style={{ transform: 'translateX(25px)' }}>起点/终点</h4>
                <h4 style={{ transform: 'translateX(28px)' }}>航线进程</h4>
                <h4 style={{ transform: 'translateX(8px)' }}>状态</h4>
            </div>
            <div className='flight_table_content'>
                <table>
                    <tbody>
                        {filterFlightData.map((flight, index) => (
                            <tr onClick={() => { handleClickFlightList(flight.flight_number) }} key={index} className={`status-${flight.flight_status}`} >
                                <td>
                                    <img src="/assets/listimg.png" alt="" width="20" height='20' />
                                </td>
                                <td>{flight.flight_number}</td>
                                <td>{flight.flight_plan}</td>
                                <td>{flight.flight_destination}</td>
                                <td>{flight.flight_progress}%</td>
                                <td>
                                    <span className={`status-indicator ${flight.flight_status}`} />
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