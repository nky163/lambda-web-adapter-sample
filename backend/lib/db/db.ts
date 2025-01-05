import pgPromise , { IDatabase } from 'pg-promise';

type ConnectionInfo = {
  host: string;
  port: number;
  password: string;
  database: string;
  user: string;
}

const pgp = pgPromise();

export class DB {
  private static instanceMap: Map<string, IDatabase<any>> = new Map();
  private constructor() {}
  
  private static getConnectionString = (connectionInfo: ConnectionInfo): string => 
    `postgres://${connectionInfo.user}:${connectionInfo.password}@${connectionInfo.host}:${connectionInfo.port}/${connectionInfo.database}`
  
  public static getInstance(connectionInfo: ConnectionInfo): IDatabase<any> {
    
    const connectionString = this.getConnectionString(connectionInfo);
    
    if (!DB.instanceMap.has(connectionString)) {
      DB.instanceMap.set(connectionString, pgp(connectionString));
    }
    return DB.instanceMap.get(connectionString)!;
  }
}

export { pgp };
