import { useState } from 'react';
import * as Cesium from 'cesium'
import { ConfinedArea } from '../../../../global-env';
import './index.less'
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatch, RootState } from '../../../../store';
import { resetAllParams } from '../../../../store/modules/rightClickTargetReducer';
interface RightClickProps {
    pickedX: number;
    pickedY: number;
    viewer: Cesium.Viewer | null;
    confinedAreaStore: ConfinedArea[];
}



const RightClick: React.FC<RightClickProps> = ({
    pickedX, pickedY, viewer, confinedAreaStore
}) => {
    // 选择控制策略
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const { id, isConfigured, timeSpan, confineMethod, subscription } = useSelector((state: RootState) => state.onRightClickTarget)
    const dispatch: RootDispatch = useDispatch()

    const handleOptionChange = (e: any) => {
        setSelectedOption(e.target.value)
    };
    // 设置限制时间
    const handleDateChange = (e: any) => {
        setSelectedDate(e.target.value)
    };
    // 提交限制区域
    const confineAareSubmit = (e: any) => {
        e.preventDefault()
        if (selectedDate && selectedOption) {
            const newArea = {
                id: id,
                type: 'area',
                timeSpan: selectedDate,
                confineMethod: selectedOption,
                subscription: "这是一段关于该地区的描述",
                isConfigured: true
            }
            confinedAreaStore.push(newArea)
            if (viewer) {
                let area = viewer.entities.getById(id)
                if (area) {
                    area.name = 'specificArea_Configured'
                    area.label = new Cesium.LabelGraphics({
                        text: '已控制',
                        // font: '40px Helvetica',
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 20,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    })
                }
            }
        }
        dispatch(resetAllParams())
    }
    // 取消限制区域
    const cancelConfineAare = () => {
        let tId = id
        if (viewer) {
            confinedAreaStore.filter(item => item.id != tId)
            viewer.entities.removeById(tId)
        }
        dispatch(resetAllParams())
    }

    return (
        <div
            className='pop'
            style={{
                top: pickedY,
                left: pickedX,
            }}
        >
            <div className='confine_area_container'>
                <div className='confine_area_title'>
                    {isConfigured && <div className='confine_area_configured_title'>
                        <span>控制策略：{confineMethod}</span>
                        <button className='confine_area_button' style={{ padding: '1px,3px,1px,3xp' }} onClick={cancelConfineAare}>解除限制</button>
                    </div>}
                </div>
                <div className='confine_area_content'>
                    <span className='confine_area_title' >
                        <span>{timeSpan ? timeSpan : '未设置状态'}</span>
                        <img src={'/src/asset/confine.png'} alt="" width={'140px'} height={'140px'} />
                    </span>
                    <span>Subscription:这是一个可设置限制的区域</span>
                    <span style={{ width: '400px' }}>{subscription ? subscription : ''}</span>
                </div>
                {!isConfigured && <div className='confine_area_control'>
                    <span className='confine_area_control_title'>限制区控制策略</span>
                    <form onSubmit={confineAareSubmit} className='confine_area_form_container'>
                        <span className='confine_area_control_date_title'>请输入限飞有效期</span>
                        <input
                            type="date"
                            className='input_time'
                            value={selectedDate}
                            onChange={handleDateChange}
                            required // 添加必填属性
                        />
                        <div className='confine_area_control_form'>
                            <div className='confine_area_control_input'>
                                <label className={selectedOption === 'PersuasionBack' ? 'checked' : ''}>
                                    <input
                                        type="radio"
                                        name="option"
                                        value="PersuasionBack"
                                        checked={selectedOption === 'PersuasionBack'}
                                        onChange={handleOptionChange}
                                    />
                                    <span className='radio_text'>劝返</span>
                                </label>
                            </div>
                            <div className='confine_area_control_input'>
                                <label className={selectedOption === 'ForcedLanding' ? 'checked' : ''}>
                                    <input
                                        type="radio"
                                        name="option"
                                        value="ForcedLanding"
                                        checked={selectedOption === 'ForcedLanding'}
                                        onChange={handleOptionChange}
                                    />
                                    <span className='radio_text'>迫降</span>
                                </label>
                            </div>
                        </div>

                        <div className='confine_area_button_container'>
                            <button className='confine_area_control_button' type="submit">提交</button>
                            <button
                                className='confine_area_control_button'
                                type="button"
                                onClick={() => {
                                    setSelectedOption('');
                                    dispatch(resetAllParams());
                                    setSelectedDate('');
                                }}
                            >
                                取消
                            </button>
                        </div>
                    </form>
                </div>}
            </div>
        </div>
    )
};

export default RightClick;