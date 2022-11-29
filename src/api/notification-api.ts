import {io, Socket} from "socket.io-client";

let socket:Socket;
export const notificationApi = {
    connectChannel(){
        socket = io('http://localhost:3001', { transports: ["websocket", "polling", "flashsocket"], autoConnect: false })
        socket.connect();
    },
    disconnectChannel(){
        socket.disconnect();
    },
    receiveNotification(callback: any){
        socket.on('receive_message', msg => {
            console.log(msg)
            callback(msg);
            return msg;
        });
    }
}