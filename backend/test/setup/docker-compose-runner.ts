import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

const dockerComposeFile = path.resolve(__dirname, '../docker-compose.yaml');

async function runDockerCompose() {
  try {
    console.log('Starting Docker Compose services...');
    await execPromise(`docker compose -f ${dockerComposeFile} up test-db -d`);
    console.log('Docker Compose services started successfully.');
  } catch (error: any) {
    console.error('Failed to start Docker Compose services:', error.stderr || error.message);
    throw error;
  }
}

async function stopDockerCompose() {
  try {
    console.log('Stopping Docker Compose services...');
    await execPromise(`docker compose -f ${dockerComposeFile} down test-db`);
    console.log('Docker Compose services stopped successfully.');
  } catch (error: any) {
    console.error('Failed to stop Docker Compose services:', error.stderr || error.message);
    throw error;
  }
}

export { runDockerCompose, stopDockerCompose };