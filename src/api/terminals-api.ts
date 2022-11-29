import {FilterType, SorterType} from "../redux/tasks_reducer";
import {instance, TerminalsAPI} from "./api";

export const terminalsAPI = {
    getFilteredTerminals(limit: number, page: number, filters: Array<FilterType | null>, sorter: SorterType | null) {
        let filtersPagams: string = '';
        if(filters!==null && filters!==undefined) {
            filtersPagams = filters.map((filter) => {
                    if (filter !== null){
                        return filter.fieldName + (filter.condition != null && filter.condition !== undefined ? `__${filter.condition}` : '') + (filter.value != null && filter.value !== undefined ? Array.isArray(filter.value) ? '=' + filter.value.join() : '=' + filter.value : '')
                    } else return null
                }
            ).filter(item => item !== null).join('&')
        }
        return instance.get<TerminalsAPI>(`terminal?limit=${limit}&page=${page}${filtersPagams===''?'':'&'+filtersPagams}${sorter?.sort === null || sorter?.field === undefined?'': '&order=' + sorter.field + '__' + sorter.sort}`)
    },
    getVoiceFromTerminal(terminal: string){
        return instance.get<string>(`terminal/voice?terminal=${terminal}`).then(res => res.data);
    }
}