import { execSync } from 'child_process';
import path from 'path';

const COMPOSE_FILE = path.resolve(__dirname, '../docker/docker-compose.yaml');
const ENV_FILE = path.resolve(__dirname, '../.env.test');

export default async () => {
  console.log('Global teardown: Stopping database container...');
  try {
    execSync(`docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE} down db aws-resource`);
    console.log('Database container stopped');
  } catch (error) {
    console.error('Failed to stop database container:', error);
  }
};
