import { IDatabase, ITask } from 'pg-promise';

export class TransactionManager {
  private db: IDatabase<any>
  constructor(db: IDatabase<any>) {
    this.db = db;
  }
  async execute<T>(callback: (t: ITask<any>) => Promise<T>): Promise<T> {
    return this.db.tx(async (t) => {
      try {
        const result = await callback(t);
        return result;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    });
  }
}