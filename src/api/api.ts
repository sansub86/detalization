import axios from 'axios'
import {PaginationLinksType, TicketType} from "../redux/tasks_reducer";
import {TerminalType} from "../redux/terminals_reducer";
import {CdrType} from "../redux/cdr_reducer";

export const instance = axios.create({
    withCredentials: true,
    baseURL: 'http://localhost:3001/',
});

export type TicketsAPI = {
    items: Array<TicketType>,
    links: PaginationLinksType,
    meta: {
        currentPage: number,
        itemCount: number,
        itemsPerPage: number,
        totalItems: number,
        totalPages: number
    }
}
export type TerminalsAPI = {
    items: Array<TerminalType>,
    links: PaginationLinksType,
    meta: {
        currentPage: number,
        itemCount: number,
        itemsPerPage: number,
        totalItems: number,
        totalPages: number
    }
}
export type CdrsAPI = {
    items: Array<CdrType>,
    links: PaginationLinksType,
    meta: {
        currentPage: number,
        itemCount: number,
        itemsPerPage: number,
        totalItems: number,
        totalPages: number
    }
}