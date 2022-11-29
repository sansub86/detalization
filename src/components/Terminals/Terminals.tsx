import React, {useEffect, useRef, useState} from 'react'
import {Button, DatePicker, Descriptions, Input, Space, Table, Tag} from "antd";
import {CheckCircleOutlined, CloseCircleOutlined, FilterFilled, SearchOutlined, SyncOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import {useDispatch, useSelector} from "react-redux";
import {geTerminalRangeValues} from "../../redux/selectors/terminals_selector";
import {InitialStateType, requestTerminals, setTerminalFromNotice} from "../../redux/terminals_reducer";
import {AppStateType, setDefaultValues} from "../../redux/redux-store";
import moment from "moment";
import s from './Terminals.module.css';
import {addTerminalsToSchedule, removeTerminalsToSchedule, sendRequestToDashpoard} from "../../redux/tasks_reducer";
import {NavLink} from "react-router-dom";

const TerminalsPage: React.FC = () => {
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [selectedTerminals, setSelectedTerminals] = useState([]);
    const [selectedTableKeys, setSelectedTableKeys] = useState([]);
    let defaultValues = useSelector(geTerminalRangeValues);
    let searchInput = useRef<Input>(null);
    const rangePickerRef = useRef(null);
    const {RangePicker} = DatePicker;
    const {login} = useSelector((state: AppStateType) => state.auth)
    const {
        terminals,
        pagination,
        isLoading,
        filters,
        sorter
    }: InitialStateType = useSelector((state: AppStateType) => state.terminalsPage);
    const { notificationMessage } = useSelector((state: AppStateType) => state.auth)
    const paginationAnt = {
        current: pagination.currentPage,
        pageSize: pagination.itemsPerPage,
        total: pagination.totalItems
    }
    const handleReset = (clearFilters: () => void, dataIndex: string) => {
        clearFilters();
        setSearchText('');
    };
    const handleSearch = (selectedKeys: Array<string>, confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
        defaultValues[dataIndex] = selectedKeys;
    };
    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}: any) => (
            <div style={{padding: 8}}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex.toString())}
                    style={{marginBottom: 8, display: 'block'}}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex.toString())}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters, dataIndex.toString())} size="small"
                            style={{width: 90}}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({closeDropdown: false});
                            setSearchText(selectedKeys[0])
                            setSearchedColumn(dataIndex.toString())
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => searchInput.current !== null ? searchInput.current.select() : null, 100);
            }
        },
        render: (text: string) => {
            if (dataIndex.toString() === 'terminal') {
                return <NavLink to={'/cdr/' + text}>{text}</NavLink>
            } else {
                return text
            }

        },
    });
    const getColumnDateProps = (dataIndex: string) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}: any) => {
            return <div style={{padding: 8}}>
                <div style={{marginBottom: 8, display: 'block'}}>
                    <RangePicker
                        ref={rangePickerRef}
                        name="Picker"
                        showTime
                        onChange={(datatime, datatimestring) => {
                            setSelectedKeys(datatimestring)
                        }}
                        value={defaultValues[dataIndex] ? [moment(defaultValues[dataIndex][0]), moment(defaultValues[dataIndex][1])] : undefined}
                    />
                </div>
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex.toString())}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >Search
                    </Button>
                    <Button onClick={() => {
                        handleReset(clearFilters, dataIndex.toString())
                    }} size="small" style={{width: 90}}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({closeDropdown: false});
                            setSearchText(selectedKeys[0])
                            setSearchedColumn(dataIndex.toString())
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        },
        filterIcon: (filtered: boolean) => {
            // console.log(filtered);
            return <FilterFilled style={{color: filtered ? '#1890ff' : undefined}}/>
        },
        filteredValue: defaultValues[dataIndex],
        render: (text: string) =>
            searchedColumn === dataIndex.toString() ? (
                <Highlighter
                    highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                (text === '1899-12-30 15:12:29') ? '' : text
            ),
    });
    const handleTableChange = (paginationAnt: any, filtersAnt: any, sorter: any) => {
        dispatch(requestTerminals(paginationAnt.pageSize, paginationAnt.current, Object.keys(filtersAnt).map((field: string) => {
            if (filtersAnt[field] !== null || filtersAnt[field] !== undefined) {
                if (field === 'expiration' || field === 'statusTerminalSynchronized' || field === 'lastRequestCDR') {
                    if (filtersAnt[field] === null || filtersAnt[field] === undefined) return null
                    else return ({
                        fieldName: field,
                        filteredType: 'datatime',
                        condition: 'between',
                        value: filtersAnt[field].toString(),
                    })
                } else {
                    if (filtersAnt[field] === null || filtersAnt[field] === undefined) return null
                    else {
                        return ({
                            fieldName: field,
                            filteredType: 'string',
                            condition: 'contains',
                            value: filtersAnt[field].map((item: Array<string>) => item.toString()),
                        })
                    }
                }
            }
            return null;
        }), {field: sorter.field, sort: sorter.order === undefined ? null : sorter.order.slice(0, -3)}))
    }
    useEffect(() => {
        dispatch(requestTerminals(pagination.itemsPerPage, pagination.currentPage, filters, sorter))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buttonDisabled])
    useEffect(()=>{
        if(notificationMessage){
            dispatch(setTerminalFromNotice(notificationMessage.terminal, notificationMessage.type))
        }
    }, [notificationMessage])

    const columns = [
        {
            title: 'Дилер',
            dataIndex: 'dealer',
            width: '7%',
            defaultFilteredValue: setDefaultValues('dealer', filters),
            ...getColumnSearchProps('dealer')
        },
        {
            title: 'Холдинг',
            dataIndex: 'holding',
            width: '7%',
            defaultFilteredValue: setDefaultValues('holding', filters),
            ...getColumnSearchProps('holding')
        },
        {
            title: 'Организация',
            dataIndex: 'organization',
            defaultFilteredValue: setDefaultValues('organization', filters),
            width: '7%',
            ...getColumnSearchProps('organization')
        },
        {
            title: 'Терминал',
            dataIndex: 'terminal',
            width: '9%',
            defaultFilteredValue: setDefaultValues('terminal', filters),
            ...getColumnSearchProps('terminal')
        },
        {
            title: 'Голосовой номер',
            dataIndex: 'voice',
            width: '6%',
            defaultFilteredValue: setDefaultValues('voice', filters),
            ...getColumnSearchProps('voice')
        },
        {
            title: 'Провайдер',
            dataIndex: 'provider',
            width: '4%',
        },
        {
            title: 'Система',
            dataIndex: 'system',
            width: '4%',
        },
        {
            title: 'Статус терминала',
            dataIndex: 'terminalStatus',
            defaultFilteredValue: setDefaultValues('terminalStatus', filters),
            filters: [
                {text: 'Активен', value: 'Активен'},
                {text: 'Блокирован', value: 'Блокирован'},
                {text: 'Деактивирован', value: 'Деактивирован'},
                {text: 'Нет минут', value: 'Нет минут'},
                {text: 'Не активен', value: 'Не активен'}
            ],
            width: '6%',
        },
        {
            title: 'Дата блокировки',
            dataIndex: 'expiration',
            sorter: true,
            defaultFilteredValue: setDefaultValues('expiration', filters),
            ...getColumnDateProps('expiration'),
            width: '8%',
        },
        {
            title: 'Синхронизация с issa',
            sorter: true,
            dataIndex: 'statusTerminalSynchronized',
            defaultFilteredValue: setDefaultValues('statusTerminalSynchronized', filters),
            ...getColumnDateProps('statusTerminalSynchronized'),
            width: '8%',
        },
        {
            title: 'Состоятие загрузки',
            dataIndex: 'agentEnabled',
            width: '6%',
            filters: [
                {text: 'Вкл', value: 1},
                {text: 'Выкл', value: 0},
            ],
            defaultFilteredValue: setDefaultValues('agentEnabled', filters),
            render: (status: boolean) => {
                switch (status) {
                    case false:
                        return (
                            <Tag icon={<CloseCircleOutlined/>} color="error">
                                Выкл
                            </Tag>
                        )
                    case true:
                        return (
                            <Tag icon={<CheckCircleOutlined/>} color="success">
                                Вкл
                            </Tag>
                        )
                    default:
                        return 0

                }
            },
        },
        {
            title: 'Расписание',
            dataIndex: 'scheduler',
            defaultFilteredValue: setDefaultValues('scheduler', filters),
            width: '4%',
        },
        {
            title: 'Последний запрос CDR',
            dataIndex: 'lastRequestCDR',
            sorter: true,
            width: '8%',
            defaultFilteredValue: setDefaultValues('lastRequestCDR', filters),
            ...getColumnDateProps('lastRequestCDR'),
        },
        {
            title: 'Статус последнего запроса',
            dataIndex: 'lastRequestCDRStatus',
            width: '6%',
            filters: [
                {text: 'Завершен', value: 1},
                {text: 'Обрабатывается', value: 2},
                {text: 'Ошибка', value: 3},
            ],
            defaultFilteredValue: setDefaultValues('lastRequestCDRStatus', filters),
            render: (status: number) => {
                switch (status) {
                    case 0:
                        return ''
                    case 1:
                        return (
                            <Tag icon={<CheckCircleOutlined/>} color="success">
                                Завершен
                            </Tag>
                        )
                    case 2:
                        return (
                            <Tag icon={<SyncOutlined spin/>} color="processing">
                                Обрабатывается
                            </Tag>
                        )
                    case 3:
                        return (
                            <Tag icon={<CloseCircleOutlined/>} color="error">
                                Ошибка
                            </Tag>
                        )
                    default:
                        return 0

                }
            }
        },
        {
            title: 'Тикет последнего запроса',
            dataIndex: 'lastRequestTicket',
            width: '4%',
        }
    ];
    const rowSelection = {
        selectedRowKeys: selectedTableKeys,
        onChange: (selectedRowKeys: any, selectedRows: any) => {
            setSelectedTerminals(selectedRows.map((item: any) => item.terminal))
            setSelectedTableKeys(selectedRowKeys);
            selectedRowKeys.length > 0 ? setButtonDisabled(false) : setButtonDisabled(true)
        },
        columnWidth: '4%'
    };
    const onSendRequestHandler = () => {
        dispatch(sendRequestToDashpoard(selectedTerminals, login));
        setSelectedTerminals([]);
        setSelectedTableKeys([]);
        setButtonDisabled(true);
    }
    const onAddToSchedule = async () => {
        await dispatch(addTerminalsToSchedule(selectedTerminals));
        setSelectedTerminals([]);
        setSelectedTableKeys([])
        setButtonDisabled(true);
        //setTimeout(()=>setButtonDisabled(true), 1000);
    }
    const onRemoveToSchedule = async () => {
        await dispatch(removeTerminalsToSchedule(selectedTerminals));
        setSelectedTerminals([]);
        setSelectedTableKeys([]);
        setButtonDisabled(true);
    }
    return (
        <div>
            <div className={s.navigation_panel}>
                <Descriptions size="small">
                    <Descriptions.Item label="Всего">{pagination.totalItems}</Descriptions.Item>
                </Descriptions>
                <Button className={s.button} key="1" onClick={onAddToSchedule} disabled={buttonDisabled}>Добавить в
                    расписание</Button>
                <Button className={s.button} key="2" onClick={onRemoveToSchedule} disabled={buttonDisabled}>Удалить из
                    расписания</Button>
                <Button key="3" onClick={onSendRequestHandler} disabled={buttonDisabled}>Отправить запрос</Button>
            </div>
            <Table
                className={s.header}
                size="small"
                rowSelection={{
                    type: 'checkbox',
                    ...rowSelection,
                }}
                columns={columns}
                rowKey={record => record.id}
                dataSource={terminals}
                pagination={paginationAnt}
                loading={isLoading}
                onChange={handleTableChange}
                scroll={{y: 'calc(100vh - 296px)'}}
            />
        </div>
    );
}
export default TerminalsPage;