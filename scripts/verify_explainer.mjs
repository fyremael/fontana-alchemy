import { chromium } from 'playwright';
import path from 'path';

const artifactDir = 'C:\\Users\\jamie\\.gemini\\antigravity\\brain\\f8db1cbf-4249-4109-b291-775b07a7d4d8';

async function runExplainerVerification() {
  console.log('🚀 Launching Playwright to capture Explainer Modal...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

  // Wait for canvas
  await page.waitForSelector('canvas');

  // Click HOW IT WORKS button
  console.log('📖 Clicking HOW IT WORKS...');
  const guideBtn = await page.getByRole('button', { name: /HOW IT WORKS/i });
  await guideBtn.click();
  await page.waitForTimeout(600);

  // Take screenshot of Tab 1 (Core Intuition)
  const shot1Path = path.join(artifactDir, 'alchemy_explainer_lay_speak.png');
  await page.screenshot({ path: shot1Path });
  console.log(`📸 Saved Explainer Tab 1: ${shot1Path}`);

  // Switch to Tab 2 (The Three Phases)
  console.log('🔄 Switching to Tab 2 (Three Phases)...');
  const tab2Btn = await page.getByRole('button', { name: /Three Phases of Matter/i });
  await tab2Btn.click();
  await page.waitForTimeout(400);

  const shot2Path = path.join(artifactDir, 'alchemy_explainer_phases.png');
  await page.screenshot({ path: shot2Path });
  console.log(`📸 Saved Explainer Tab 2: ${shot2Path}`);

  await browser.close();
  console.log('✅ Explainer verification finished!');
}

runExplainerVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
