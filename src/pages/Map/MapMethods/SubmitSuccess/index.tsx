import { useEffect, useState } from 'react';
import './index.less';

interface Props {
    message: string
    targetId: string
}

const SubmitSuccess: React.FC<Props> = ({ message,targetId }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSuccess, setIsSuccess] = useState('Successful');

    useEffect(() => {
        // 模拟提交逻辑
        if (message === 'ForcedLanding' || message === 'PersuasionBack') {
            setIsSubmitted(true)
            setIsSuccess('Successful')
        }

        setTimeout(() => setIsSubmitted(false), 3000); // 3秒后自动关闭弹窗
    },[message,targetId])

    return (
        <div className="app-container">
            {isSubmitted && (
                <div className="success-popup">
                    <p>Submission {isSuccess}!</p>
                </div>
            )}
        </div>
    );
};

export default SubmitSuccess;
