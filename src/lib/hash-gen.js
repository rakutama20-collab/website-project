const bcrypt = require('bcryptjs');

async function run() {
  const hash = await bcrypt.hash('password', 10);
  console.log('--- この文字列をコピーしてください ---');
  console.log(hash);
  console.log('------------------------------------');
}

run();