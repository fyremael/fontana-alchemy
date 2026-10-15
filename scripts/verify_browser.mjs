import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\jamie\\.gemini\\antigravity\\brain\\f8db1cbf-4249-4109-b291-775b07a7d4d8';

async function runBrowserVerification() {
  console.log('🚀 Launching Playwright browser for AlChemy verification...');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Listen to console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  console.log('🌐 Navigating to http://127.0.0.1:5173 ...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

  // 1. Verify canvas loaded
  await page.waitForSelector('canvas');
  console.log('✅ Canvas detected!');

  // Wait 2 seconds for physics & collisions in Level 0
  await page.waitForTimeout(2000);

  const shot1Path = path.join(artifactDir, 'alchemy_level0_entropic_gas.png');
  await page.screenshot({ path: shot1Path });
  console.log(`📸 Saved Level 0 screenshot: ${shot1Path}`);

  // 2. Trigger Phase 1 Triplet (Hypercycle nucleation)
  console.log('⚡ Triggering Phase 1 Catalytic Triplet transition...');
  const tripletBtn = await page.getByRole('button', { name: /Phase 1 Triplet/i });
  await tripletBtn.click();

  // Allow reaction hypercycle to multiply and dilute ambient noise
  console.log('⏳ Simulating 4 seconds of CSTR autopoietic kinetics...');
  await page.waitForTimeout(4000);

  const shot2Path = path.join(artifactDir, 'alchemy_level1_autopoietic_closure.png');
  await page.screenshot({ path: shot2Path });
  console.log(`📸 Saved Level 1 screenshot: ${shot2Path}`);

  // 3. Open Reaction Crucible
  console.log('🔬 Opening Reaction Crucible modal...');
  const crucibleBtn = await page.getByRole('button', { name: /REACTION CRUCIBLE/i });
  await crucibleBtn.click();

  await page.waitForTimeout(1000);

  // Click A + B -> C preset in Crucible
  const presetBtn = await page.getByRole('button', { name: /A \+ B → C/i });
  if (await presetBtn.isVisible()) {
    await presetBtn.click();
    await page.waitForTimeout(500);
  }

  const shot3Path = path.join(artifactDir, 'alchemy_crucible_reduction_trace.png');
  await page.screenshot({ path: shot3Path });
  console.log(`📸 Saved Reaction Crucible screenshot: ${shot3Path}`);

  // Close crucible
  const closeBtn = await page.getByRole('button', { name: '✕' }).or(page.locator('button:has(svg.lucide-x)'));
  await closeBtn.first().click();
  await page.waitForTimeout(500);

  // 4. Trigger Phase 2 Stress & Parasite Perturbation
  console.log('🛡️ Triggering Phase 2 Perturbation & Parasites...');
  const perturbBtn = await page.getByRole('button', { name: /Phase 2 Perturb/i });
  await perturbBtn.click();

  const parasiteBtn = await page.getByRole('button', { name: /Inject Parasites/i });
  await parasiteBtn.click();

  await page.waitForTimeout(3500);

  const shot4Path = path.join(artifactDir, 'alchemy_level2_immune_boundary.png');
  await page.screenshot({ path: shot4Path });
  console.log(`📸 Saved Level 2 screenshot: ${shot4Path}`);

  await browser.close();
  console.log('\n🎉 ALL BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!\n');
}

runBrowserVerification().catch(err => {
  console.error('❌ Browser verification error:', err);
  process.exit(1);
});
