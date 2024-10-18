import { Redis } from "ioredis" 

let instance;

export function getRedisInstance() {

    if(!instance) {
        instance = new Redis({
            host: "redis-10811.c73.us-east-1-2.ec2.redns.redis-cloud.com", 
            port: "10811", 
            username: "default",
            password: "jNRap3QCQ4Oplsmb55mayM9L4HeClGwp"
        })
    
        instance.on("connect", () => console.log("Redis connected"))
        instance.on("error", (error) => console.log("Redis error", error))
    }

    return instance;
}       