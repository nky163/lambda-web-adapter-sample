import { Secrets } from '../../lib/secrets/Secrets';
import { DB } from '../../lib/db/db';
import { TransactionManager } from '../../lib/db/TransactionManager';

export const handler = async () => {
  const masterSecret = await Secrets.getSecret(process.env.MASTER_USER_SECRET_ARN!);
  const userSecret = await Secrets.getSecret(process.env.APP_USER_SECRET_ARN!);
  
  const appDatabase = process.env.APP_DDATABASE;

  const db = DB.getInstance({
    host: masterSecret.host,
    port: Number(masterSecret.port),
    password: masterSecret.password,
    database: masterSecret.dbname,
    user: masterSecret.username,
  });
  
  const tm = new TransactionManager(db);

  try {
    const dbExists = await db.oneOrNone(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [appDatabase]
    );

    if (!dbExists) {
      await db.none(`CREATE DATABASE $[appDatabase:name];`, { appDatabase });
      console.log(`Database "${appDatabase}" created successfully.`);
    } else {
      console.log(`Database "${appDatabase}" already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    return;
  }

  await tm.execute(async (t) => {
    console.log('Starting transaction...');
    await t.none(`SET timezone TO 'Asia/Tokyo';`);

    const userExists = await t.oneOrNone(
      `SELECT 1 FROM pg_roles WHERE rolname = $1;`,
      [userSecret.username]
    );

    if (!userExists) {
      await t.none(`CREATE USER $[username:name];`, { username: userSecret.username });
      console.log(`User "${userSecret.username}" created.`);
    } else {
      console.log(`User "${userSecret.username}" already exists. Skipping creation.`);
    }

    await t.none(
      `ALTER USER $[username:name] WITH PASSWORD $[password];`,
      { username: userSecret.username, password: userSecret.password }
    );
    console.log(`Password set for user "${userSecret.username}".`);

    await t.none(
      `ALTER DATABASE $[appDatabase:name] OWNER TO $[username:name];`,
      { appDatabase, username: userSecret.username }
    );
    console.log(
      `Database "${appDatabase}" ownership transferred to user "${userSecret.username}".`
    );

    console.log('Transaction committed successfully.');
  });
  
};
