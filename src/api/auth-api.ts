import {instance} from "./api";


export const authAPI = {
    login(username: string, password: string){
        return instance.post('auth/login',{ username: username, password: password })
    },
    logout(){
        return instance.delete(`auth/login`);
    },
    me(){
        return instance.get(`auth/profile`)
    }
}
