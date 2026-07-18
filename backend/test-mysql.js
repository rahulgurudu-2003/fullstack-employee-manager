const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const passwords = ['root', 'admin', 'password', '123456', 'rahul', 'Admin@123', 'admin123', ''];

// Find mysql path
let mysqlPath = null;
const mysqlDir = 'C:\\Program Files\\MySQL';
if (fs.existsSync(mysqlDir)) {
  try {
    const subdirs = fs.readdirSync(mysqlDir);
    for (const subdir of subdirs) {
      const checkPath = path.join(mysqlDir, subdir, 'bin', 'mysql.exe');
      if (fs.existsSync(checkPath)) {
        mysqlPath = checkPath;
        break;
      }
    }
  } catch (e) {
    console.log('Error scanning MySQL dir:', e.message);
  }
}

if (!mysqlPath) {
  // Try default path if exists
  const defaultPath = 'C:\\Program Files\\MySQL\\MySQL Server 9.1\\bin\\mysql.exe';
  if (fs.existsSync(defaultPath)) {
    mysqlPath = defaultPath;
  }
}

if (!mysqlPath) {
  console.log('RESULT:NO_MYSQL_FOUND');
  process.exit(1);
}

console.log(`Found mysql.exe at: ${mysqlPath}`);

function testPassword(index) {
  if (index >= passwords.length) {
    console.log('RESULT:NONE_WORKED');
    process.exit(1);
  }

  const password = passwords[index];
  // Run mysql command to check if login succeeds
  const cmd = `"${mysqlPath}" -u root -p"${password}" -h 127.0.0.1 -e "SELECT 1"`;

  exec(cmd, (error, stdout, stderr) => {
    console.log(`Testing password: "${password}"`);
    if (error) {
      console.log(`Error: ${stderr.trim() || error.message.trim()}`);
    } else {
      console.log(`Stdout: ${stdout.trim()}`);
      if (stdout.includes('1')) {
        console.log(`RESULT:SUCCESS:${password}`);
        process.exit(0);
      }
    }
    testPassword(index + 1);
  });
}

testPassword(0);
