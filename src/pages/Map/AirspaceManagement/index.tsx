import React, { useState } from 'react';
import './index.less'

interface AirspaceManagementProps {
  province: string
  city: string
}

const AirspaceManagement: React.FC<AirspaceManagementProps> = ({ province, city }) => {
  // 模拟表格数据 (50条)
  const airspaceList = new Array(12).fill(0).map((_, index) => ({
    bannedType: index % 3 === 0 ? '遣返区域' : index % 3 === 1 ? '禁止区域' : '迫降区域',
    aid: '9236'+ index,
    position: `40'N-116'E`,
  }));

  const[searchValue, setSearchValue]=useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const filterList = airspaceList.filter(airspace => airspace.aid.toLowerCase().includes(searchValue.toLowerCase()))


  return (
    <div className="airspace_container">
      <div className='airspace_title_bar'>
        <div className='airspace_title_text'>
          <span>{province}-{city}</span>
          <span>数据截止时间: 2024.10.12 16:00</span>
        </div>
        <div className='airspace_title_type'>
          <img src="/src/asset/banned.png" alt=""  width='auto' height='50px' />
          <div className='airspace_titlt_type_info'>
            <span>43</span>
            <span>禁飞区</span>
          </div>
        </div>
        <div className='airspace_title_type'>
          <img src="/src/asset/landing.png" alt="" width='auto' height='50px'/>
          <div className='airspace_titlt_type_info'>
            <span>20</span>
            <span>迫降区</span>
          </div>
        </div>
        <div className='airspace_title_type'>
          <img src="/src/asset/goback.png" alt="" width='auto' height='50px'/>
          <div className='airspace_titlt_type_info'>
            <span>23</span>
            <span>遣返区</span>
          </div>
        </div>
        <div className='airspace_search'>
          <img src="/src/asset/tabler_search.png" alt="" width='30' height='30' />
          <input className='airspace_search_input' type="text" placeholder='请输入区域代号' onChange={handleInputChange}/>
        </div>


      </div>
      <div className='airspace_content_list'>
        {filterList.map((item, index) => (
          <div key={index} className='airspace_content_item'>
            <div className='airspace_content_item_info'>
              <div className='airspace_content_item_title'>{item.bannedType}</div>
              <div className='airspace_content_item_id'>区域ID:{item.aid}</div>
              <div className='airspace_content_item_poistion'>位置:{item.position}</div>
            </div>
            <img src={`/src/asset/${item.bannedType==='遣返区域'?'goback':item.bannedType==='禁止区域'?'banned':'landing'}.png`} alt="" width='auto' height='50px' />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AirspaceManagement;