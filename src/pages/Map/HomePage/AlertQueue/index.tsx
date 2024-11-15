import { useEffect, useState } from 'react'
import './index.less'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store'
interface AlertQueueProps {
    clickTohandleAlert: (id:string) => void
}

const AlertQueue: React.FC<AlertQueueProps> = ({clickTohandleAlert}) => {
    const { alertQueue,finishedAlerts } = useSelector((state: RootState) => state.alertQueueStore)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const itemsPerPage = 8

    const changePage = (direction: number) => {
        const newPage = currentPage + direction;
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    }

    const currentItems = alertQueue.slice(
        (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage
    );

    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(alertQueue.length / itemsPerPage)))
    }, [alertQueue])



    return (
        <div className="alert_container">
            <div className='alert_title_container'>
                <div className='alert_queue_title'>预警消息队列</div>
                <div className='alert_queue_statistics'>
                    <div className='alert_queue_statistics_classification'>
                        <div className='alert_queue_statistics_pending'>{finishedAlerts.length+alertQueue.length}</div>
                        <div className='alert_queue_statistics_done'>{finishedAlerts.length}</div>
                    </div>
                    <div className='alert_queue_statistics_total'>{alertQueue.length}</div>
                </div>
            </div>
            <div className='alert_queue_content'>
                <div className='alert_queue_content_page_control'>
                    <button className='alert_queue_content_page_control_button' onClick={() => changePage(-1)}>▲</button>
                    <div className='alert_queue_content_page_number'>{String(currentPage).padStart(2, '0')}</div>
                    <div>/</div>
                    <div className='alert_queue_content_page_total'>{String(totalPages).padStart(2, '0')}</div>
                    <button className='alert_queue_content_page_control_button' onClick={() => changePage(1)}>▼</button>
                </div>
                {currentItems.length > 0 && <div className='alert_queue_content_list'>
                    {currentItems.map((item, index) => (
                        <div className='alert_queue_content_item' key={index} onClick={() => {clickTohandleAlert(item.id)}}>
                            <div className='alert_queue_content_item_title'>
                                <div className='alert_queue_content_item_title_text'>{item.title}</div>
                                <img src='/assets/banned.png' width={30} height={30} className='alert_queue_content_item_title_icon' />
                            </div>
                            <button className='alert_queue_content_item_button'>点击查看</button>
                        </div>
                    ))}
                </div>}
            </div>
        </div>
    )
}

export default AlertQueue