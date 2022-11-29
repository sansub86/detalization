import React, {useEffect, useRef, useState} from 'react';
import {requestUsers} from "../../redux/users_reducer";
import {useDispatch, useSelector} from "react-redux";
import {AppStateType, setDefaultValues} from "../../redux/redux-store";
import {Input, Space, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {InitialStateType} from "../../redux/users_reducer";
import {requestTickets} from "../../redux/tasks_reducer";
import {CheckCircleOutlined, CloseCircleOutlined, SyncOutlined} from "@ant-design/icons";
import style from "../Tasks/Tasks.module.css";

interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
    tags: string[];
}

const Settings: React.FC = (props) => {

    const dispatch = useDispatch();
    const {
        users,
        pagination,
        isLoading,
        filters,
        sorter
    }: InitialStateType = useSelector((state: AppStateType) => state.usersPage)
    const handleTableChange = () => {
        dispatch(requestUsers())
    }
    const columns = [
        {
            title: 'Имя пользователя',
            dataIndex: 'username',
            width: '12%',
        },
        {
            title: 'e-mail',
            dataIndex: 'email',
            width: '12%',
        },
        {
            title: 'Полное имя',
            dataIndex: 'displayName',
            width: '12%',
        },
        {
            title: 'Роли',
            dataIndex: 'roles',
            width: '12%',
        },
    ];
    useEffect(() => {
        dispatch(requestUsers())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div>
            <h2>Пользователи</h2>
            <Table
                columns={columns}
                size={'small'}
                scroll={{y: 'calc(100vh - 210px)'}}
                className={style.header}
                rowKey={record => record.id}
                dataSource={users}
                loading={isLoading}
                onChange={handleTableChange}
                pagination={false}
            />
        </div>
    )
};
export default Settings;