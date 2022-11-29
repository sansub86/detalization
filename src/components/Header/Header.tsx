import React, {useEffect, useState} from 'react';
import s from './Header.module.css';
import {Link, NavLink} from "react-router-dom";
import {Avatar, Dropdown, Menu, notification, PageHeader} from 'antd';
import {useDispatch, useSelector} from "react-redux";
import {AppStateType} from "../../redux/redux-store";
import {
    AppstoreOutlined,
    ExportOutlined,
    LogoutOutlined,
    MailOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";
import {logout} from "../../redux/auth_reducer";

const Header: React.FC = (props) => {
    const {isAuth, login, notificationMessage} = useSelector((state: AppStateType) => state.auth);
    const [current, setCurrent] = useState('mail');
    const dispatch = useDispatch();
    const handleClick = (e: any) => {
        setCurrent(e.key);
    };
    const onLogout = () => {
        dispatch(logout());
    };
    const placement = 'topRight';
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => openNotification(), [notificationMessage]);
    const openNotification = () => {
        if (notificationMessage?.id) {
            switch (notificationMessage.type) {
                case 'info':
                    notification.info({
                        message: `Уведомление`,
                        description:
                        notificationMessage.message,
                        placement,
                    });
                    break;
                case 'warn':
                    notification.warn({
                        message: `Предупреждение`,
                        description:
                        notificationMessage.message,
                        placement,
                    });
                    break;
                case 'error':
                    notification.error({
                        message: `Ошибка`,
                        description:
                        notificationMessage.message,
                        placement,
                    });
                    break;
                default:
                    break;
            }

        }
    };
    return (
        <header>
            <PageHeader
                ghost={false}
                title="Детальки Iridium"
                subTitle="автоматическая отправка запросов в dashboard"
                className={s.header}
                extra={[
                    <div key='headerBlock' className={s.loginBlock}>
                        {isAuth ? <Dropdown
                            className={s.userDropdown}
                            overlay={
                                <Menu>
                                    <Menu.Item icon={<SettingOutlined />}> <Link to="/settings">Настройки</Link></Menu.Item>
                                    <Menu.Item icon={<LogoutOutlined />} onClick={onLogout}>Выйти</Menu.Item>
                                </Menu>
                            }
                            trigger={["click"]}
                            placement="bottomLeft"
                        >
                            <div onClick={e => e.preventDefault()}>
                                <Avatar size="large" icon={<UserOutlined/>}/>
                                {login}
                            </div>
                        </Dropdown>:
                            <NavLink to='/login'>Войти</NavLink>}
                    </div>
                ]}
            >
            </PageHeader>
            {isAuth ? <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
                <Menu.Item key="terminals" icon={<MailOutlined/>}>
                    <Link to="/terminals">Терминалы</Link>
                </Menu.Item>
                <Menu.Item key="task" icon={<AppstoreOutlined/>}>
                    <Link to="/tasks">Задачи</Link>
                </Menu.Item>
                <Menu.Item key="settings" icon={<SettingOutlined/>}>
                    <Link to="/settings">Администрирование</Link>
                </Menu.Item>
            </Menu> : ''}
        </header>
    );
};

export default Header;
