import {BaseThunkType, InferActionsTypes} from "./redux-store";
import {ticketsAPI} from "../api/tasks-api";
import {FilterValue} from "antd/es/table/interface";
import {initializeApp} from "./app_reducer";
import { logout } from "./auth_reducer";

export type TicketType = {
    id: number,
    ticket: string
    terminal: string,
    status: number,
    attempts: number,
    statusDescription: string,
    createdAt: string,
    lastDownloadAttempt: string,
}
export type PaginationLinksType = {
    first: string,
    previous: string,
    next: string,
    last: string
}
export type PaginationType = {
    currentPage: number,
    itemCount: number,
    itemsPerPage: number,
    totalItems: number,
    totalPages: number,
    links: PaginationLinksType
}
export type SorterType = {
    field: string,
    sort:   'asc' | 'desc'
}
let initialState = {
    tickets: [] as Array<TicketType>,
    pagination: {
       currentPage: 1,
       itemsPerPage: 100,
    } as PaginationType,
    isLoading: false,
    filters: [] as Array<FilterType>,
    sorter: null as SorterType | null
}

export type FilterType = {
    fieldName: string
    filteredType: 'string'|'datatime'
    condition: 'contains' | 'startswith' | 'endswith' | 'isnull' | 'lt' | 'lte' | 'gt' |  'gte' | 'in' | 'between' | null,
    value: Array<string> | null | FilterValue,
}

export const actions = {
    setTickets: (tickets: Array<TicketType>) => ({type: 'TICKETS/SET_TICKETS', tickets} as const),
    setPagination: (pagination: PaginationType) => ({type: 'TICKETS/SET_PAGINATION', pagination} as const),
    toggleIsLoading: (isLoading: boolean) => ({type: 'TICKETS/TOGGLE_IS_LOADING', isLoading} as const),
    setFilters: (filters:Array<FilterType|null>) => ({type: 'TICKETS/SET_FILTERS', filters} as const),
    setSorter: (sorter: SorterType|null) => ({type: 'TICKETS/SET_SORTER', sorter} as const)
}

const tasksReducer = (state = initialState, action: ActionsType) => {
    switch(action.type){
        case 'TICKETS/SET_TICKETS':
            return {
                ...state,
                tickets: action.tickets.map(item => ({...item, createdAt: item.createdAt.replace(/T/, ' ').replace(/\..+/, ''), lastDownloadAttempt: item.lastDownloadAttempt.replace(/T/, ' ').replace(/\..+/, '')}))
            }
        case 'TICKETS/SET_PAGINATION':
            return {
                ...state,
                pagination: action.pagination
            }
        case 'TICKETS/TOGGLE_IS_LOADING':
            return {
                ...state, isLoading: action.isLoading
            }
        case 'TICKETS/SET_FILTERS':
            return {
                ...state,
               filters: action.filters!==null?[...action.filters]: null
            }
        case 'TICKETS/SET_SORTER':
            return {
                ...state,
                sorter: action.sorter
            }
        default:
            return state;
    }
}

export const requestTickets = (limit: number, page: number, filters: Array<FilterType | null>, sorter: SorterType | null):ThunkType => async (dispatch) => {
    dispatch(actions.toggleIsLoading(true))
    dispatch(actions.setFilters(filters))
    dispatch(actions.setSorter(sorter))
    await ticketsAPI.getFilteredTickets(limit, page, filters, sorter).then(res => {
        if(res.status === 200){
            dispatch(actions.setTickets(res.data.items));
            dispatch(actions.setPagination({...res.data.meta, links: res.data.links}));
        }
    }).catch((e) => {
        if (e.response.data.statusCode === 401) {
            dispatch(logout());
        }
    });
    dispatch(actions.toggleIsLoading(false));

}
export const sendRequestToDashpoard = (terminals: Array<string>, user: string | null):ThunkType=> async (dispatch) => {
    await ticketsAPI.sendRequestToDashboard(terminals, user);
}
export const addTerminalsToSchedule = (terminals: Array<string>):ThunkType=> async (dispatch) => {
   await ticketsAPI.addTerminalsToSchedule(terminals);
}
export const removeTerminalsToSchedule = (terminals: Array<string>):ThunkType=> async (dispatch) => {
    await ticketsAPI.removeTerminalsToSchedule(terminals);
}
type ActionsType = InferActionsTypes<typeof actions>
export type InitialStateType = typeof initialState;
type ThunkType = BaseThunkType<ActionsType>
export default tasksReducer;
