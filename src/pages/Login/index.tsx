import { Card, Form, Input, Button, message } from "antd";
import './index.less'
import React from 'react';
// import { useDispatch } from "react-redux";
// import { fetchLogin } from "../../store/modules/userReducer";
import { RootDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    // const dispatch: RootDispatch = useDispatch()
    const nav = useNavigate()
    const onFinish = async (values: RootState) => {
        console.log('Success', values)
        // await dispatch(fetchLogin(values))
        nav('/Map')
        message.success('Login Success')

    }

    const onFinishFailed = (error: any) => {
        console.log('Login Failed', error)
    }

    return (
        <div className="login">
            <Card className="login-container">
                {/* <img className="login-logo" src={logo} alt="" /> */}
                <Form
                    validateTrigger="onBlur"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="Number"
                        name="mobile"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter your number!',

                            },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: 'unvalid number'
                            }
                        ]}
                    >
                        <Input size="large" placeholder="Please enter your number"></Input>
                    </Form.Item>
                    <Form.Item
                        label="Verification code"
                        name="code"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter verification code!'
                            },
                            {
                                pattern: /^\d{4}$/,
                                message: 'unvalid number'
                            }
                        ]}>
                        <Input size="large" placeholder="Please enter verification code"></Input>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block> Login in</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Login