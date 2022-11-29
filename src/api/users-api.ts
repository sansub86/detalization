import {instance} from "./api";
export const usersAPI = {
    getUserById(id: number) {
        return instance.get(`users/${id}`);
    },
    getAllUsers(){

        return instance.get('users');
    }
}