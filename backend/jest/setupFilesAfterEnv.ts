import { execSync } from 'child_process';
import path from 'path';

const DB_CONTAINER_NAME = process.env.DB_CONTAINER_NAME;
const BACKUP_FILE = path.resolve(__dirname, '../docker/snapshot.dump');

afterEach(() => {
  console.log('🔄 Restoring PostgreSQL snapshot...');
  try {
    execSync(
      `docker cp ${BACKUP_FILE} ${DB_CONTAINER_NAME}:/tmp/snapshot.dump`,
      { stdio: 'inherit' }
    );
    execSync(
      `docker exec ${DB_CONTAINER_NAME} pg_restore -U $POSTGRES_USER -d $POSTGRES_DB --clean --if-exists -Fc /tmp/snapshot.dump`,
      { stdio: 'inherit' }
    );
    console.log('✅ PostgreSQL snapshot restored.');
  } catch (error) {
    console.error('❌ Failed to restore snapshot:', error);
    process.exit(1);
  }
});