import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Checkbox, DatePicker, Descriptions, Divider, Input, Modal, Select, Space, Table, Tooltip} from "antd";
import {InitialStateType, requestCdrs} from "../../redux/cdr_reducer";
import {AppStateType} from "../../redux/redux-store";
import {FileExcelOutlined, FilterFilled, SearchOutlined, SettingOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment from "moment";
import {getCdrRangeValues} from '../../redux/selectors/cdr_selectors';
import {useParams} from "react-router-dom";
import style from './cdr.module.css'
import s from "../CDR/cdr.module.css";
import {FilterType} from "../../redux/tasks_reducer";
import {cdrsAPI} from "../../api/cdr-api";
import Excel from 'exceljs';
import {excelColumns} from "./excelCdr";
import {saveAs} from 'file-saver';
import {CheckboxValueType} from "antd/es/checkbox/Group";
import {CheckboxChangeEvent} from "antd/es/checkbox";

const {Option, OptGroup} = Select;

type PathParamsType = {
    terminal: string
}
const getFilters = (filtersAnt: any): Array<FilterType | null> => (
    Object.keys(filtersAnt).map((field: string) => {
        if (filtersAnt[field] !== null || filtersAnt[field] !== undefined) {
            if (field === 'startDate' || field === 'endDate' || field === 'createdAt') {
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
    })
)
const CheckboxGroup = Checkbox.Group;
const CdrPage: React.FC = (props) => {
    const workbook = new Excel.Workbook();
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    let defaultValues = useSelector(getCdrRangeValues);
    let searchInput = useRef<Input>(null);
    const rangePickerRef = useRef(null);
    const {RangePicker} = DatePicker;
    let {terminal}: PathParamsType = useParams();
    const [modal2Open, setModal2Open] = useState(false);
    const [searchedColumn, setSearchedColumn] = useState('');
    const {
        cdrs,
        voice,
        pagination,
        isLoading,
        filters,
        sorter
    }: InitialStateType = useSelector((state: AppStateType) => state.cdrPage);
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
        render: (text: string) =>
            searchedColumn === dataIndex.toString() ? (
                <Highlighter
                    highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
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
                text
            ),
    });
    const handleTableChange = (paginationAnt: any, filtersAnt: any, sorter: any) => {
        dispatch(requestCdrs(terminal, paginationAnt.pageSize, paginationAnt.current, getFilters(filtersAnt), {
            field: sorter.field,
            sort: sorter.order === undefined ? null : sorter.order.slice(0, -3)
        }))
    }
    const saveExcel = async () => {
        const [cdrsForExcel] = await cdrsAPI.getFilteredCdrForExcel(terminal, filters)
        const dataExcel = cdrsForExcel.map(item => {
            return {
                year: (new Date(item.startDate)).getFullYear().toString().substr(2, 2),
                month: (new Date(item.startDate)).getMonth().toString(),
                phone: item.voice,
                name: 'Мобил',
                call_date: moment(item.startDate).utc().format("DD.MM.YYYY"),
                time_date: moment(item.startDate).utc().format("HH:mm:ss"),
                call_number: item.called,
                region: item.area,
                region_name: '',
                duration: moment(moment(item.endDate).diff(moment(item.startDate), 'seconds') * 1000).utc().format('H:mm:ss'),
                payment_seconds: item.duration.toString(),
                call_type: '',
                user_answer: item.state,
                balance_units: item.balance.toString(),
                balance_minutes: Math.trunc(item.balance / 60).toString()
            }
        });
        try {
            const worksheet = workbook.addWorksheet('Детализация');
            worksheet.views = [
                {state: 'frozen', ySplit: 3, activeCell: 'A1'}
            ];
            worksheet.columns = excelColumns;
            worksheet.columns.forEach(column => {
                column.font = {name: 'Tahoma', size: 8};
            });
            dataExcel.forEach(singleData => {
                worksheet.addRow(singleData);
            });
            worksheet.eachRow({includeEmpty: false}, item => {
                item.height = 10.5;
                item.alignment = {vertical: 'middle'}

            });
            worksheet.spliceRows(1, 0, [], [])
            worksheet.getRow(1).height = 15;
            worksheet.getRow(1).font = {name: 'Tahoma', size: 12, bold: true};
            worksheet.mergeCells('A1:O1');
            worksheet.getCell('A1').alignment = {horizontal: 'center'};
            worksheet.getCell('A1').value = "Детализация переговоров " + voice;
            worksheet.getRow(2).height = 10.5;
            worksheet.getRow(3).height = 42;
            worksheet.getColumn(5).numFmt = 'dd mmmm yy';
            worksheet.getRow(3).font = {name: 'Tahoma', size: 8};
            worksheet.getRow(3).eachCell({includeEmpty: true}, (cell => {
                cell.alignment = {vertical: 'top', horizontal: 'center', wrapText: true};
            }));
            const buf = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buf]), `${terminal}.xlsx`);
        } catch (error) {
            console.error('<<<ERRROR>>>', error);
            console.error('Something Went Wrong', error.message);
        } finally {
            workbook.removeWorksheet(terminal);
        }
    }


    const columns = [
        {
            title: 'Вызываемый номер',
            dataIndex: 'called',
            width: '8%',
            ...getColumnSearchProps('called')
        },
        {
            title: 'Время начала звонка',
            dataIndex: 'startDate',
            sorter: true,
            ...getColumnDateProps('startDate'),
            width: '8%',
        },
        {
            title: 'Время окончания звонка',
            dataIndex: 'endDate',
            sorter: true,
            ...getColumnDateProps('endDate'),
            width: '8%',
        },
        {
            title: 'Регион вызыв.номера',
            dataIndex: 'area',
            width: '12%',
        },
        {
            title: 'Длительность',
            dataIndex: ['startDate', 'endDate'],
            render: (text: string, row: { startDate: string, endDate: string }) => {
                let sec = moment(row.endDate).diff(moment(row.startDate), 'seconds');
                return moment(sec * 1000).format('mm:ss');
            },
            //...getColumnSearchProps('duration'),
            width: '4%',
        },
        {
            title: 'Платные секунды',
            dataIndex: 'duration',
            ...getColumnSearchProps('duration'),
            width: '4%',
        },
        {
            title: 'Ответ абонента',
            dataIndex: 'state',
            width: '6%',
        },
        {
            title: 'Баланс(в юнитах)',
            dataIndex: 'balance',
            sorter: true,
            width: '6%',
        }
    ];
    const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(columns.map(item => item.title));
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(true);
    const plainOptions = columns.map(item => item.title);
    const onChange = (list: CheckboxValueType[]) => {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < plainOptions.length);
        setCheckAll(list.length === plainOptions.length);
    };

    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        setCheckedList(e.target.checked ? plainOptions : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
    };
    useEffect(() => {
        dispatch(requestCdrs(terminal, pagination.itemsPerPage, pagination.currentPage, filters, sorter))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div>
            <div className={s.navigation_panel}>
                <Descriptions size="small">
                    <Descriptions.Item className={s.detalization_all}
                                       label="Всего">{pagination.totalItems?.toString()}</Descriptions.Item>
                    <Descriptions.Item className={s.detalization_header}>Детализация
                        переговоров {voice}</Descriptions.Item>
                </Descriptions>
                <Space>
                    <Tooltip title="Выгрузить в Excel">
                        <Button className={s.button} icon={<FileExcelOutlined onClick={saveExcel}/>}/>
                    </Tooltip>
                    <Tooltip title="Настройки">
                        <Button className={s.button} icon={<SettingOutlined onClick={() => setModal2Open(true)}/>}/>
                    </Tooltip>
                </Space>
                <Modal
                    title="Отобразить столбцы"
                    className={s.modal_style}
                    visible={modal2Open}
                    cancelText='Отмена'
                    width='300px'
                    onOk={() => {
                        setModal2Open(false);
                        console.log(checkedList);
                    }}
                    onCancel={() => setModal2Open(false)}
                >
                    <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>Выбрать все</Checkbox>
                    <Divider style={{margin: '12px 0'}}/>
                    <CheckboxGroup className={s.check_box_group} options={plainOptions} value={checkedList} onChange={onChange} />
                </Modal>
            </div>
            <Table
                size={'small'}
                columns={columns.filter(item => checkedList.includes(item.title))}
                className={style.table}
                rowClassName={(record, index): string => {
                    return (record.state === "RINGING" ? style.ringing : '')
                }
                }
                rowKey={record => record.id}
                scroll={{y: 'calc(100vh - 188px)'}}
                dataSource={cdrs}
                pagination={paginationAnt}
                loading={isLoading}
                onChange={handleTableChange}
            />
        </div>

    );
}
export default CdrPage;
