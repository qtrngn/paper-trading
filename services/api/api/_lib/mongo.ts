import {MongoClient} from "mongodb";

// HELPERS
function Env(name:string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing ${name}`)
    return v; 
}

const uri = Env("MONGODB_URI");
const dbName = Env("MONGODB_DB");

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
    var _mongoIndexesEnsured: boolean | undefined; 
}

export async function getDb() {
    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    const client = await global._mongoClientPromise;
    return client.db(dbName)
}


