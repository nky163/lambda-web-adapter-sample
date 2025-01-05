const { execSync } = require('child_process');
const dotenv = require('dotenv');

const env = process.argv[2];

if (!env || (env !== 'cloud' && env !== 'local')) {
  console.error('Usage: node migrate.js [aurora|local]');
  process.exit(1);
}

dotenv.config({ path: `.env.${env}` });

const command = `npx node-pg-migrate up`;

console.log(`Running migration on ${env} environment...`);

try {
  execSync(command, { stdio: 'inherit' });
  console.log(`Migration on ${env} environment completed successfully.`);
} catch (error) {
  console.error(`Migration failed on ${env} environment.`);
  process.exit(1);
}
