import { BaseThunkType, InferActionsTypes } from "./redux-store";
import {authAPI} from "../api/auth-api";
import {notificationApi} from "../api/notification-api";
import {Dispatch} from "redux";
import {setTerminalFromNotice} from "./terminals_reducer";

const SET_USER_DATA = 'SET_USER_DATA';
const SET_NOTIFICATION = 'SET_NOTIFICATION';

type ActionsType = InferActionsTypes<typeof actions>
export type InitialStateType = typeof InitialState;
type ThunkType = BaseThunkType<ActionsType>
export type NotificationMessageType = { id: string, type: string, terminal:string, message: string}

let InitialState = {
    userId: null as number | null,
    login: null as string | null,
    email: null as string | null,
    displayName: null as string | null,
    isAuth: false,
    notificationMessage: null as NotificationMessageType | null,
}
export const actions = {
    setAuthUserData: (userId: number | null, login: string | null, email: string | null, displayName: string | null, isAuth: boolean) => ({
        type: 'SET_USER_DATA',
        payload: {userId, login, email, displayName, isAuth}
    } as const),
    setNotification: (notificationMessage: NotificationMessageType) => ({
        type: 'SET_NOTIFICATION',
        payload: { notificationMessage}
    } as const)
}

const authReducer = (state = InitialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case SET_USER_DATA:
            return {...state, ...action.payload}
        case SET_NOTIFICATION:
            return {...state, ...action.payload}
        default:
            return state;
    }
};
export const login = (username: string, password: string):ThunkType => async (dispatch) => {
    return await authAPI.login(username, password).then(response => {
        if(response.status === 200) {
            dispatch(actions.setAuthUserData(response.data.id, response.data.username, response.data.email, response.data.displayName, true));
            notificationApi.connectChannel();
            notificationApi.receiveNotification(newMessageHandlerCreator(dispatch));
        }
    }).catch(exception => console.log("Login error" + exception));
};
export const getAuthUserData = ():ThunkType => async (dispatch) => {
    await authAPI.me().then(response => {
        //console.log(response.data)
        if(response.status === 200){
            dispatch(actions.setAuthUserData(response.data.id, response.data.username, response.data.email, response.data.displayName, true))
            notificationApi.connectChannel();
            notificationApi.receiveNotification(newMessageHandlerCreator(dispatch));
        }
    }).catch(exception => console.log("GetAuthApi error" + exception));

};

export const logout = ():ThunkType => async (dispatch) => {
   //Разлогиниваемся
   await authAPI.logout().then(response => {
           if (response.status === 200) {
               dispatch(actions.setAuthUserData(null, null, null, null, false));
               notificationApi.disconnectChannel();
           }
       }
   ).catch(exception => console.log("Logout error" + exception));
};
let _newMessageHandler: ((message: NotificationMessageType) => void) | null = null;
const newMessageHandlerCreator = (dispatch: Dispatch) => {
        _newMessageHandler = (message) => {
            dispatch(actions.setNotification(message));
        }
    return _newMessageHandler
}
export default authReducer;