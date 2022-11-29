import {AppStateType} from "../redux-store";

export const getRangeValues = (state: AppStateType) => {
     let result: any = {};
          // @ts-ignore
    state.tasksPage.filters?.forEach(item => {
        if(item !== null && item.filteredType === 'datatime'){
            result[`${item.fieldName}`] = typeof item.value === "string"? item.value.split(","): item.value ;
        } else if(item !== null && item.filteredType === 'string') {
            result[`${item.fieldName}`] = item.value
        }
    })
    return result;
};
