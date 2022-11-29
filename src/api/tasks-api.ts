import {instance, TicketsAPI} from "./api";
import {FilterType, SorterType} from "../redux/tasks_reducer";


export const ticketsAPI = {
    getFilteredTickets(limit: number, page: number, filters: Array<FilterType | null>, sorter: SorterType | null) {
        let filtersPagams: string = '';
        if(filters!==null && filters!==undefined) {
            filtersPagams = filters.map((filter) => {
              if (filter !== null){
                  return filter.fieldName + (filter.condition != null && filter.condition !== undefined ? `__${filter.condition}` : '') + (filter.value != null && filter.value !== undefined ? Array.isArray(filter.value) ? '=' + filter.value.join() : '=' + filter.value : '')
              } else return null
            }
            ).filter(item => item !== null).join('&')
        }
        return instance.get<TicketsAPI>(`tasks/tickets?limit=${limit}&page=${page}${filtersPagams===''?'':'&'+filtersPagams}${sorter?.sort === null || sorter?.field === undefined?'': '&order=' + sorter.field + '__' + sorter.sort}`)
    },
    sendRequestToDashboard(terminals: Array<string>, user: string | null){
       return instance.post<TicketsAPI>(`tasks/addJobRequestToDashboard`, {terminals: terminals, user: user});
    },
    addTerminalsToSchedule(terminals: Array<string>){
        return instance.post<TicketsAPI>(`tasks/addAgent`, {terminals: terminals});
    },
    removeTerminalsToSchedule(terminals: Array<string>){
        return instance.post<TicketsAPI>(`tasks/removeAgent`, {terminals: terminals});
    }

}