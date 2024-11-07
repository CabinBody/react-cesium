import DistributionList from './DistributionList';
import VideoMonitor from './VideoMonitor';
import ManagementPieChart from './ManagementPieChart';
import MissionFinishedChart from './MissionFinishedChart';
import Dashboard from './Dashboard';
import './index.less'
import AlertQueue from './AlertQueue';

interface HomePageProps {
    clickTohandleAlert: (id:string) => void
}

const HomePage: React.FC<HomePageProps> = ({ clickTohandleAlert }) => {
    return (
        <div className='homepage_container'>
            <div className='map_data_show'>
                {/* 左侧边信息栏 */}
                <div className={`left_container`}>
                    <DistributionList ></DistributionList>
                    <MissionFinishedChart></MissionFinishedChart>
                </div>
                {/* 右侧边信息栏 */}
                <div className={`right_container`}>
                    <VideoMonitor></VideoMonitor>
                    <ManagementPieChart></ManagementPieChart>
                    <Dashboard></Dashboard>
                </div>
                <div className='bottom_container'>
                    <AlertQueue clickTohandleAlert={clickTohandleAlert}></AlertQueue>
                </div>

            </div>
        </div>
    )
};

export default HomePage;