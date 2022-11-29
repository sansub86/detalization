import { getAuthUserData } from "./auth_reducer";
import {InferActionsTypes} from "./redux-store";

const INITIALIZE = 'INITIALIZE';

export type InitialStateType = typeof InitialState
type ActionsType = InferActionsTypes<typeof actions>

let InitialState = {
    initialized: false
};
const appReducer = (state = InitialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case INITIALIZE:
            return {
                ...state,
                initialized: action.initialized,
            };

        default:
            return state;
    }
};
export const actions = {
    initializeApp: (initialized: boolean) => ({type: 'INITIALIZE', initialized})
};

export const initializeApp = () => (dispatch: any) => {

    dispatch(getAuthUserData()).then(() => {
        console.log("Initialize")
        dispatch(actions.initializeApp(true));
    })
};
export default appReducer;