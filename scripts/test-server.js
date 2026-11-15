const http = require('http');
const { spawn } = require('child_process');

async function testRoute(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );

    req.on('error', (err) => reject(err));
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('Starting Next.js production server for end-to-end verification...');
  const server = spawn('npx.cmd', ['next', 'start', '-p', '3000'], {
    shell: true,
    stdio: 'ignore',
  });

  // Give server 3 seconds to bind
  await new Promise((r) => setTimeout(r, 3500));

  try {
    const tests = [
      { name: '1. Home Page (3 Big Buttons UI)', path: '/' },
      { name: '2. Prescription Page', path: '/prescription' },
      { name: '3. Schedule & Voice Page', path: '/schedule' },
      { name: '4. Health Safety Loop (Sugar/BP)', path: '/health' },
      { name: '5. Drug Safety Interaction Checker', path: '/safety' },
      { name: '6. Generic Alternatives & Calculator', path: '/generics' },
      { name: '7. Honesty & Limits Page', path: '/limits' },
      {
        name: '8. API: Analyze Prescription (Demo Mode with <0.7 Confidence)',
        path: '/api/analyze-prescription',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDemo: true }),
        },
      },
      {
        name: '9. API: Drug Safety (Warfarin + Aspirin Interaction)',
        path: '/api/drug-safety',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicines: ['Warfarin', 'Aspirin'], isDemo: true, language: 'hi' }),
        },
      },
      {
        name: '10. API: Voice Script Generator (Hindi Schedule)',
        path: '/api/voice-script',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule: [], isDemo: true, language: 'hi' }),
        },
      },
    ];

    let passed = 0;
    for (const test of tests) {
      try {
        const res = await testRoute(test.path, test.options);
        if (res.status === 200) {
          console.log(`[PASS] ${test.name} -> HTTP ${res.status}`);
          passed++;
        } else {
          console.error(`[FAIL] ${test.name} -> HTTP ${res.status}`);
        }
      } catch (e) {
        console.error(`[ERROR] ${test.name}:`, e.message);
      }
    }

    console.log(`\n========================================`);
    console.log(`VERIFICATION SUMMARY: ${passed}/${tests.length} tests passed successfully!`);
    console.log(`========================================\n`);
  } finally {
    console.log('Shutting down server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
    } else {
      server.kill('SIGTERM');
    }
  }
}

run();
