import {FilterType, SorterType} from "../redux/tasks_reducer";
import {CdrsAPI, instance} from "./api";
import {CdrType} from "../redux/cdr_reducer";
const getFilterParams = (filters: Array<FilterType| null>) =>{
    let filtersPagams: string = '';
    if(filters!==null && filters!==undefined) {
        filtersPagams = filters.map((filter) => {
                if (filter !== null){
                    return filter.fieldName + (filter.condition != null && filter.condition !== undefined ? `__${filter.condition}` : '') + (filter.value != null && filter.value !== undefined ? Array.isArray(filter.value) ? '=' + filter.value.join() : '=' + filter.value : '')
                } else return null
            }
        ).filter(item => item !== null).join('&')
    }
    return filtersPagams;
}
export const cdrsAPI = {
    getFilteredCdr(terminal: string, limit: number, page: number, filters: Array<FilterType | null>, sorter: SorterType | null) {
        let filtersStr: string = getFilterParams(filters);
        return instance.get<CdrsAPI>(`cdr?terminal=${terminal}&limit=${limit}&page=${page}${filtersStr===''?'':'&'+filtersStr}${sorter?.sort === null || sorter?.field === undefined?'': '&order=' + sorter.field + '__' + sorter.sort}`);
    },
    getFilteredCdrForExcel(terminal: string, filters: Array<FilterType | null>){
        let filtersStr: string = getFilterParams(filters);
        return instance.get<[Array<CdrType>, number]>(`cdr/excel?terminal=${terminal}${filtersStr===''?'':'&'+filtersStr}`).then(res => res.data);
    },
}