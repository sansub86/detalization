import {Button, DatePicker, Input, Space, Table, Tag} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppStateType, setDefaultValues} from "../../redux/redux-store";
import Highlighter from 'react-highlight-words';
import moment from 'moment'
import {InitialStateType, requestTickets} from "../../redux/tasks_reducer";
import {CheckCircleOutlined, CloseCircleOutlined, FilterFilled, SearchOutlined, SyncOutlined} from '@ant-design/icons';
import {getRangeValues} from "../../redux/selectors/tasks_selectors";
import style from "./Tasks.module.css";

const TasksPage: React.FC = () => {

    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    let searchInput = useRef<Input>(null);
    const rangePickerRef = useRef(null);
    let defaultValues = useSelector(getRangeValues);
    const { RangePicker } = DatePicker;
    const { tickets, pagination, isLoading, filters, sorter }: InitialStateType = useSelector((state: AppStateType) => state.tasksPage);
    const paginationAnt = { current: pagination.currentPage, pageSize: pagination.itemsPerPage, total: pagination.totalItems}
    const handleTableChange = (paginationAnt: any, filtersAnt:any, sorter:any) => {
        dispatch(requestTickets(paginationAnt.pageSize, paginationAnt.current, Object.keys(filtersAnt).map((field: string) => {
            if (filtersAnt[field] !== null || filtersAnt[field] !== undefined) {
                if (field === 'createdAt' || field === 'lastDownloadAttempt') {
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
        }), {field: sorter.field, sort: sorter.order === undefined? null : sorter.order.slice(0,-3)}))
    }

    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex.toString())}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex.toString())}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters, dataIndex.toString())} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText(selectedKeys[0])
                            setSearchedColumn(dataIndex.toString())
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: (visible:boolean) => {
            if (visible) {
                setTimeout(() => searchInput.current !== null? searchInput.current.select():null, 100);
            }
        },
        render: (text: string) =>
            searchedColumn === dataIndex.toString() ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const getColumnDateProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => {
            return <div style={{padding: 8}}>
                <div style={{marginBottom: 8, display: 'block'}}>
                    <RangePicker
                        ref={rangePickerRef}
                        name = "Picker"
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
            return <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        filteredValue: defaultValues[dataIndex],
        render: (text: string) =>
            searchedColumn === dataIndex.toString() ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleReset = (clearFilters: ()=>void, dataIndex: string) => {
        clearFilters();
        setSearchText('');
    };
    const handleSearch = (selectedKeys: Array<string>, confirm: ()=>void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
        defaultValues[dataIndex] = selectedKeys;
    };
    useEffect(() => {
        dispatch(requestTickets(pagination.itemsPerPage,pagination.currentPage,filters, sorter))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const columns = [
        {
            title: 'Тикет',
            dataIndex: 'ticket',
            width: '8%',
            defaultFilteredValue: setDefaultValues('ticket', filters),
            ...getColumnSearchProps('ticket')
        },
        {
            title: 'Терминал',
            dataIndex: 'terminal',
            width: '12%',
            defaultFilteredValue: setDefaultValues('terminal', filters),
            ...getColumnSearchProps('terminal')
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: '8%',
            defaultFilteredValue: setDefaultValues('status', filters),
            filters: [
                { text: 'Обрабатывается', value: 0 },
                { text: 'Завершен', value: 1 },
                { text: 'Ошибка', value: 3 },
            ],
            render: (status: number) => {
                switch (status) {
                    case 0:
                        return (
                            <Tag icon={<SyncOutlined spin />} color="processing">
                                Обрабатывается
                            </Tag>
                        )
                    case 1:
                        return (
                            <Tag icon={<CheckCircleOutlined/>} color="success">
                                Завершен
                            </Tag>
                        )
                    case 3:
                        return (
                            <Tag icon={<CloseCircleOutlined />} color="error">
                                Ошибка
                            </Tag>
                        )
                    default:
                        return 0

                }
            }
        },
        {
            title: 'К-во попыток загрузки',
            dataIndex: 'attempts',
            width: '8%',
        },
        {
            title: 'Тикет создан',
            dataIndex: 'createdAt',
            sorter: true,
            ...getColumnDateProps('createdAt'),
            defaultFilteredValue: setDefaultValues('createdAt', filters),
            width: '12%',
        },
        {
            title: 'Последняя попытка загрузки',
            sorter: true,
            dataIndex: 'lastDownloadAttempt',
            defaultFilteredValue: setDefaultValues('lastDownloadAttempt', filters),
            ...getColumnDateProps('lastDownloadAttempt'),
            width: '12%',
        },
        {
            title: 'Описание',
            dataIndex: 'statusDescription',
            width: '40%',
        },
    ];
    return (
        <Table
            columns={columns}
            size={'small'}
            scroll = {{y: 'calc(100vh - 210px)'}}
            className={style.header}
            rowKey={record => record.id}
            dataSource={tickets}
            pagination={paginationAnt}
            loading={isLoading}
            onChange={handleTableChange}
        />
    );
}
export default TasksPage;