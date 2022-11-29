import {FilterType, PaginationType, SorterType} from "./tasks_reducer";
import {BaseThunkType, InferActionsTypes} from "./redux-store";
import {logout} from "./auth_reducer";
import { usersAPI } from "../api/users-api";

export type UserType = {
    id: number,
    email: string,
    username: string,
    displayName: string
}
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = BaseThunkType<ActionsType>
const actions = {
    setUsers: (users: Array<UserType>) => ({type: 'USERS/SET_USERS', users} as const),
    setPagination: (pagination: PaginationType) => ({type: 'USERS/SET_PAGINATION', pagination} as const),
    toggleIsLoading: (isLoading: boolean) => ({type: 'USERS/TOGGLE_IS_LOADING', isLoading} as const),
    setFilters: (filters: Array<FilterType|null>) =>({type: 'USERS/SET_FILTERS', filters} as const),
    setSorter: (sorter: SorterType | null) => ({type: 'USERS/SET_SORTER', sorter} as const),
}
export type InitialStateType = typeof initialState;
let initialState = {
    users: [] as Array<UserType>,
    pagination: {
        currentPage: 1,
        itemsPerPage: 100
    } as PaginationType,
    isLoading: false,
    filters: [] as Array<FilterType>,
    sorter: null as SorterType | null
}

const usersReducer = (state = initialState, action:ActionsType) => {
    switch (action.type){
        case 'USERS/SET_USERS':
            return {
                ...state,
                users: action.users
            }
        case 'USERS/SET_PAGINATION':
            return {
                ...state,
                pagination: action.pagination
            }
        case 'USERS/SET_FILTERS':
            return {
                ...state,
                filters: action.filters!==null?[...action.filters]: null
            }
        case 'USERS/SET_SORTER':
            return {
                ...state,
                sorter: action.sorter
            }

        default:
            return state;
    }
}
export const requestUsers = ():ThunkType => async (dispatch) => {
    dispatch(actions.toggleIsLoading(true))
    await usersAPI.getAllUsers().then(res => {
        if(res.status === 200){
            dispatch(actions.setUsers(res.data));
           // dispatch(actions.setPagination({...res.data.meta, links: res.data.links}));
        }
    }).catch((e) => {
        if (e.response.data.statusCode === 401) {
            dispatch(logout());
        }
    });
    dispatch(actions.toggleIsLoading(false));

}
export default usersReducer;