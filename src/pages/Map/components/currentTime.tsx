import { useState, useEffect } from 'react';

function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // 更新当前时间
    const updateTime = () => {
      setTime(new Date());
    };

    // 每秒更新一次
    const intervalId = setInterval(updateTime, 1000);

    // 清理定时器
    return () => clearInterval(intervalId);
  }, []);

  // 格式化时间
  const year = time.getFullYear()
  const month = String(time.getMonth()+1).padStart(2,'0')
  const day = String(time.getDate()).padStart(2,'0')
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  const timeString = `${year}-${month}-${day}-${hours}:${minutes}:${seconds}`

  return (
    <div>{timeString}</div>
  );
}

export default CurrentTime;
