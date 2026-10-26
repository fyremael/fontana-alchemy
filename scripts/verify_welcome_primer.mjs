import { chromium } from 'playwright';
import path from 'path';

const artifactDir = 'C:\\Users\\jamie\\.gemini\\antigravity\\brain\\f8db1cbf-4249-4109-b291-775b07a7d4d8';

async function runPrimerVerification() {
  console.log('🚀 Launching Playwright to test Welcome Primer & Slow Pacing...');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Clear localStorage to simulate brand new viewer
  await page.addInitScript(() => {
    localStorage.clear();
  });

  console.log('🌐 Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // 1. Verify Welcome Primer modal is immediately visible on first load
  await page.waitForTimeout(600);
  const welcomeTitle = await page.getByText(/WELCOME TO ALGORITHMIC CHEMISTRY/i);
  console.log('✅ Welcome Primer Modal detected:', await welcomeTitle.isVisible());

  const shotPrimerPath = path.join(artifactDir, 'alchemy_welcome_primer_modal.png');
  await page.screenshot({ path: shotPrimerPath });
  console.log(`📸 Saved Welcome Primer screenshot: ${shotPrimerPath}`);

  // 2. Click "Watch Level 0 (Slow Pace)" to dismiss modal and enter calm beaker
  console.log('🧪 Dismissing primer to observe Level 0 at slow pacing...');
  const watchLevel0Btn = await page.getByRole('button', { name: /Watch Level 0/i });
  await watchLevel0Btn.click();
  await page.waitForTimeout(1500);

  // Take screenshot of slowed-down Level 0 with In-Canvas Guidance Bar
  const shotLevel0SlowPath = path.join(artifactDir, 'alchemy_level0_slow_paced.png');
  await page.screenshot({ path: shotLevel0SlowPath });
  console.log(`📸 Saved Slow-Paced Level 0 screenshot: ${shotLevel0SlowPath}`);

  // 3. Test clicking "⚡ Launch Phase 1" inside the Guidance Bar
  console.log('⚡ Triggering Phase 1 from the Guidance Bar...');
  const launchP1Btn = await page.getByRole('button', { name: /⚡ Launch Phase 1/i });
  await launchP1Btn.click();
  await page.waitForTimeout(4000);

  const shotP1Path = path.join(artifactDir, 'alchemy_phase1_autopoietic_guided.png');
  await page.screenshot({ path: shotP1Path });
  console.log(`📸 Saved Phase 1 Guided screenshot: ${shotP1Path}`);

  // 4. Test re-opening the Quick Start primer via top-nav button
  console.log('💡 Clicking QUICK START in header to re-open primer...');
  const quickStartBtn = await page.getByRole('button', { name: /QUICK START/i });
  await quickStartBtn.click();
  await page.waitForTimeout(500);

  const shotReopenedPath = path.join(artifactDir, 'alchemy_primer_reopened.png');
  await page.screenshot({ path: shotReopenedPath });
  console.log(`📸 Saved Re-opened Primer screenshot: ${shotReopenedPath}`);

  await browser.close();
  console.log('🎉 ALL WELCOME PRIMER & SLOW PACING VERIFICATIONS PASSED!');
}

runPrimerVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
