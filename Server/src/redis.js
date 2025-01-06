import { Redis } from "ioredis" 

let instance;

export function getRedisInstance() {

    if(!instance) {
        instance = new Redis({
            host: "redis-18793.c326.us-east-1-3.ec2.redns.redis-cloud.com", 
            port: "18793", 
            username: "default",
            password: "b3apvkAcosjtK6Kb9QbJVKYhkQCDpiZk"
        })
    
        instance.on("connect", () => console.log("Redis connected"))
        instance.on("error", (error) => console.log("Redis error", error))
    }

    return instance;
}       