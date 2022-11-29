/**
 * Created by Александр on 09.03.2020.
 */
import { Form, Input, Button, Checkbox } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {login} from "../../redux/auth_reducer";
import {AppStateType} from "../../redux/redux-store";
import s from "./Login.module.css";

const layout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 4 },
};
const tailLayout = {
    wrapperCol: { offset: 1, span: 8 },
};
const Login = () => {
    const dispatch = useDispatch();
    const isAuth = useSelector((state:AppStateType) => state.auth.isAuth);
    const onFinish = (values: any) => {
        dispatch(login(values.username, values.password))
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    if (isAuth) {
        return <Redirect to={'/terminals'}/>
    }
    return (
        <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className={s.login_form}
        >
            <Form.Item
                label="Имя пользователя"
                name="username"
                rules={[{ required: true, message: 'Введите имя пользователя!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: 'Введите пароль!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item {...tailLayout} name="remember" valuePropName="checked">
                <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Войти
                </Button>
            </Form.Item>
        </Form>
    )
}
export default Login;