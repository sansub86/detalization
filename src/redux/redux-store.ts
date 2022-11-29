import { Action, combineReducers, createStore, compose, applyMiddleware } from 'redux'
import terminalsReducer from "./terminals_reducer";
import thunkMiddleware, {ThunkAction} from 'redux-thunk';
import authReducer from "./auth_reducer";
import appReducer from "./app_reducer";
import tasksReducer, {FilterType} from './tasks_reducer';
import cdrReducer from './cdr_reducer';
import {FilterValue} from "antd/lib/table/interface";
import usersReducer from "./users_reducer";

let rootReducer = combineReducers(
    {
        terminalsPage: terminalsReducer,
        tasksPage: tasksReducer,
        cdrPage: cdrReducer,
        usersPage: usersReducer,
        auth: authReducer,
        app: appReducer,
    }
);

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunkMiddleware)));
export const setDefaultValues = (column: string, filters: FilterType[]): FilterValue | string[] | null => {
        let filter = filters.find(item => item?.fieldName === column)
        if(filter !== undefined){
                return filter.value
        }else return null
}
type RootReducerType = typeof rootReducer;
export type AppStateType = ReturnType<RootReducerType>
export type InferActionsTypes<T> = T extends { [key: string]: (...args: any[]) => infer U } ? U : never
export type BaseThunkType<A extends Action, R = Promise<void>> = ThunkAction<R, AppStateType, unknown, A>

// @ts-ignore
window.store = store;

export default store;