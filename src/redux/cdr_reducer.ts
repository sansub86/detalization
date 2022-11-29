import {FilterType, PaginationType, SorterType} from "./tasks_reducer";
import {BaseThunkType, InferActionsTypes} from "./redux-store";
import {cdrsAPI} from "../api/cdr-api";
import {terminalsAPI} from "../api/terminals-api";
import {actions as initAction} from  "./app_reducer"

export type CdrType = {
    id: number,
    terminal: string,
    voice: string,
    called: string
    startDate: string,
    endDate: string,
    duration: number,
    state: string,
    balance: number,
    createdAt: string,
    area: string
}
let initialState = {
    voice:'',
    cdrs: [] as Array<CdrType>,
    pagination: {
        currentPage: 1,
        itemsPerPage: 100
    } as PaginationType,
    isLoading: false,
    filters: [] as Array<FilterType>,
    sorter: null as SorterType | null
}
export const actions = {
    setCdrs: (cdrs: Array<CdrType>) => ({type: 'CDR/SET_CDRS', cdrs} as const),
    setPagination: (pagination: PaginationType) => ({type: 'CDR/SET_PAGINATION', pagination} as const),
    toggleIsLoading: (isLoading: boolean) => ({type: 'CDR/TOGGLE_IS_LOADING', isLoading} as const),
    setFilters: (filters: Array<FilterType|null>) =>({type: 'CDR/SET_FILTERS', filters} as const),
    setSorter: (sorter: SorterType | null) => ({type: 'CDR/SET_SORTER', sorter} as const),
    setVoice: (voice: string) => ({type:'CDR/SET_VOICE', voice} as const),
}
const cdrReducer = (state = initialState, action:ActionsType) => {
    switch (action.type){
        case 'CDR/SET_CDRS':
            return {
                ...state,
                cdrs: action.cdrs.map(item => (
                    {
                        ...item,
                        startDate: item.startDate?.replace(/T/, ' ').replace(/\..+/, ''),
                        endDate: item.endDate?.replace(/T/, ' ').replace(/\..+/, ''),
                        createdAt: item.createdAt?.replace(/T/, ' ').replace(/\..+/, ''),
                    }
                ))
            }
        case 'CDR/SET_VOICE':
            return {
                ...state,
                voice: action.voice
            }
        case 'CDR/SET_PAGINATION':
            return {
                ...state,
                pagination: action.pagination
            }
        case 'CDR/SET_FILTERS':
            return {
                ...state,
                filters: action.filters!==null?[...action.filters]: null
            }
        case 'CDR/SET_SORTER':
            return {
                ...state,
                sorter: action.sorter
            }

        default:
            return state;
    }
}
export const requestCdrs = (terminal: string, limit: number, page: number, filters: Array<FilterType | null>, sorter: SorterType | null):ThunkType => async (dispatch) => {
    dispatch(actions.toggleIsLoading(true))
    dispatch(actions.setFilters(filters))
    dispatch(actions.setSorter(sorter))
    let data = await cdrsAPI.getFilteredCdr(terminal, limit, page, filters, sorter).then(res => res.data).catch((e)=>{ if(e.response.status === 401){
        initAction.initializeApp(false);
    }});
    let voice = await terminalsAPI.getVoiceFromTerminal(terminal)
    dispatch(actions.toggleIsLoading(false));
    if(data !== undefined){
        dispatch(actions.setCdrs(data.items));
        dispatch(actions.setPagination({...data.meta, links: data.links}));
        dispatch(actions.setVoice(voice));
    }
}
type ActionsType = InferActionsTypes<typeof actions>
export type InitialStateType = typeof initialState;
type ThunkType = BaseThunkType<ActionsType>
export default cdrReducer;