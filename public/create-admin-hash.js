const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('New administrator password (minimum 12 characters): ', password => {
  rl.close();
  if (!password || password.length < 12) {
    console.error('Password must contain at least 12 characters.');
    process.exit(1);
  }
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(password, salt, 64, (err, key) => {
    if (err) {
      console.error('Could not generate password hash:', err.message);
      process.exit(1);
    }
    console.log('\nSet this value as ADMIN_PASSWORD_HASH in your hosting environment:\n');
    console.log(`scrypt$${salt}$${key.toString('hex')}`);
  });
});
