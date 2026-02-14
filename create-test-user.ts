import { hashPassword } from './server/_core/password';

const email = 'demo@gmail.com';
const password = 'demo123';
const passwordHash = hashPassword(password);

console.log('Test User Credentials:');
console.log('Email:', email);
console.log('Password:', password);
console.log('Password Hash:', passwordHash);
console.log('\nSQL to insert user:');
console.log(`
INSERT INTO users (openId, email, passwordHash, name, role, status, emailVerified)
VALUES ('${email}', '${email}', '${passwordHash}', 'Demo User', 'factory', 'active', 1);
`);
