import './index.less';

interface SidebarProps {
  content: string;
}

const Sidebar: React.FC<SidebarProps> = ({ content }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {content}
      </div>
    </div>
  );
};

export default Sidebar;
