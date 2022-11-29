import {AppStateType} from "../redux-store";

export const getUsersRangeValues = (state: AppStateType) => {
    let result: any = {};
    // @ts-ignore
    state.usersPage.filters?.forEach(item => {
            result[`${item.fieldName}`] = item.value
    })
    // @ts-ignore
    return result;
};