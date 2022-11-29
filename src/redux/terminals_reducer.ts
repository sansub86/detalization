import {FilterType, PaginationType, SorterType} from "./tasks_reducer";
import {BaseThunkType, InferActionsTypes} from "./redux-store";
import {terminalsAPI} from "../api/terminals-api";
import {initializeApp} from "./app_reducer";
import { logout } from "./auth_reducer";
import terminals from "../components/Terminals/Terminals";

export type TerminalType = {
    id: number,
    dealer: string,
    holding: string,
    organization: string,
    terminal: string,
    voice: string,
    provider: string,
    system: string,
    terminalStatus: string,
    expiration: string,
    statusTerminalSynchronized: string,
    agentEnabled: string,
    scheduler: string,
    lastRequestCDR: string,
    lastRequestCDRStatus: number,
    lastRequestTicket: string
}

let initialState = {
    terminals: [] as Array<TerminalType>,
    pagination: {
        currentPage: 1,
        itemsPerPage: 100
    } as PaginationType,
    isLoading: false,
    filters: [] as Array<FilterType>,
    sorter: null as SorterType | null
}
export const actions = {
    setTerminals: (terminals: Array<TerminalType>) => ({type: 'TERMINALS/SET_TERMINALS', terminals} as const),
    setPagination: (pagination: PaginationType) => ({type: 'TERMINALS/SET_PAGINATION', pagination} as const),
    toggleIsLoading: (isLoading: boolean) => ({type: 'TERMINALS/TOGGLE_IS_LOADING', isLoading} as const),
    setFilters: (filters: Array<FilterType | null>) => ({type: 'TERMINALS/SET_FILTERS', filters} as const),
    setSorter: (sorter: SorterType | null) => ({type: 'TERMINALS/SET_SORTER', sorter} as const),
    setTerminalRequestStatus: (terminal: string | null, status: string | null) => ({type: 'TERMINALS/SET_TERMINAL_REQUEST_STATUS', terminal, status} as const)
}

const terminalsReducer = (state = initialState, action: ActionsType) => {
    switch (action.type) {
        case 'TERMINALS/SET_TERMINALS':
            return {
                ...state,
                terminals: action.terminals.map(item => (
                    {
                        ...item,
                        lastRequestCDR: item.lastRequestCDR?.replace(/T/, ' ').replace(/\..+/, ''),
                        expiration: item.expiration?.replace(/T/, ' ').replace(/\..+/, ''),
                        statusTerminalSynchronized: item.statusTerminalSynchronized?.replace(/T/, ' ').replace(/\..+/, ''),
                    }
                ))
            }
        case 'TERMINALS/SET_PAGINATION':
            return {
                ...state,
                pagination: action.pagination
            }
        case 'TERMINALS/SET_FILTERS':
            return {
                ...state,
                filters: action.filters !== null ? [...action.filters] : null
            }
        case 'TERMINALS/SET_SORTER':
            return {
                ...state,
                sorter: action.sorter
            }
        case 'TERMINALS/SET_TERMINAL_REQUEST_STATUS':
            return {
                ...state,
                terminals: state.terminals.map(item => {
                    if(item.terminal === action.terminal){
                        switch (action.status){
                            case 'info':
                                return {...item, lastRequestCDRStatus: 2}
                            case 'warn':
                                return {...item, lastRequestCDRStatus: 3}
                            case 'error':
                                return {...item, lastRequestCDRStatus: 3}
                            default:
                                return item
                        }
                    }
                    return item;
                })
            }
        default:
            return state;
    }
}
export const requestTerminals = (limit: number, page: number, filters: Array<FilterType | null>, sorter: SorterType | null): ThunkType => async (dispatch) => {
    dispatch(actions.toggleIsLoading(true))
    dispatch(actions.setFilters(filters))
    dispatch(actions.setSorter(sorter))
    await terminalsAPI.getFilteredTerminals(limit, page, filters, sorter).then(res => {
        if (res.status === 200) {
            dispatch(actions.setTerminals(res.data.items));
            dispatch(actions.setPagination({...res.data.meta, links: res.data.links}));

        }
    }).catch(e => {
        if (e.response.data.statusCode === 401) {
            dispatch(logout());
        }
    })
    dispatch(actions.toggleIsLoading(false));
}
export const setTerminalFromNotice = (terminal: string | null, status: string | null):ThunkType => async (dispatch) => {
    dispatch(actions.setTerminalRequestStatus(terminal,status))
}
type ThunkType = BaseThunkType<ActionsType>
type ActionsType = InferActionsTypes<typeof actions>
export type InitialStateType = typeof initialState;
export default terminalsReducer;