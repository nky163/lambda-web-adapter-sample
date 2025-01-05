import { execSync } from 'child_process';
import path from 'path';

const COMPOSE_FILE = path.resolve(__dirname, '../docker/docker-compose.yaml');
const ENV_FILE = path.resolve(__dirname, '../.env.test');
const DB_CONTAINER_NAME = process.env.DB_CONTAINER_NAME;

export default async () => {
  console.log('Running global setup: Applying migrations and creating snapshot...');
  
  try {
    
    console.log('Starting Docker Compose services...');
    try {
      execSync(`docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE} up -d db aws-resource `, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to start Docker Compose services:', error);
      process.exit(1);
    }
    
    execSync(`npx node-pg-migrate up`);
    console.log('Migrations applied successfully');
    
    execSync(
      `docker exec ${DB_CONTAINER_NAME} pg_dump -U $POSTGRES_USER -d $POSTGRES_DB -Fc -f /tmp/snapshot.dump`,
      { stdio: 'inherit' }
    );
    execSync(
      `docker cp ${DB_CONTAINER_NAME}:/tmp/snapshot.dump ./docker/snapshot.dump`,
      { stdio: 'inherit' }
    );
    
    console.log('Database snapshot created successfully');
  } catch (error) {
    console.error('Failed during global setup:', error);
    process.exit(1);
  }
};