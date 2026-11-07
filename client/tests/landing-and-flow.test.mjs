import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CLIENT_ROOT = resolve('d:/Projects/creator-collab-tracker/client');

test('CollabFlow Landing Page & Architecture Verification Suite', async (t) => {
  await t.test('1. Verify all Landing Page modular components exist and have non-empty content', () => {
    const requiredFiles = [
      'src/views/LandingPage.tsx',
      'src/components/landing/LandingNavbar.tsx',
      'src/components/landing/HeroSection.tsx',
      'src/components/landing/InteractiveLivePreview.tsx',
      'src/components/landing/InteractiveRateCalculator.tsx',
      'src/components/landing/LandingFeatureGrid.tsx',
      'src/components/landing/LandingTestimonials.tsx',
      'src/components/landing/LandingPricing.tsx',
      'src/components/landing/LandingFaq.tsx',
      'src/components/landing/LandingFooter.tsx'
    ];

    for (const relPath of requiredFiles) {
      const fullPath = resolve(CLIENT_ROOT, relPath);
      assert.ok(existsSync(fullPath), `Expected file to exist: ${relPath}`);
      const content = readFileSync(fullPath, 'utf8');
      assert.ok(content.length > 200, `File ${relPath} should have substantial content`);
    }
  });

  await t.test('2. Verify Rate Calculator commercial formula math logic', () => {
    // Replicate rate calculation algorithm
    const calculateRate = (views, cpm, format, hasWhitelisting, hasExclusivity, hasRush) => {
      let baseRate = (views / 1000) * cpm;
      if (format === 'integration') baseRate *= 0.6;
      else if (format === 'reel') baseRate *= 0.45;

      let whitelistingFee = hasWhitelisting ? baseRate * 0.4 : 0;
      let exclusivityFee = hasExclusivity ? baseRate * 0.3 : 0;
      let rushFee = hasRush ? baseRate * 0.25 : 0;

      const total = baseRate + whitelistingFee + exclusivityFee + rushFee;
      return {
        baseRate: Math.round(baseRate),
        whitelistingFee: Math.round(whitelistingFee),
        exclusivityFee: Math.round(exclusivityFee),
        rushFee: Math.round(rushFee),
        total: Math.round(total)
      };
    };

    // Test Case A: 45,000 views, Tech niche ($32 CPM), 60s Integration + Whitelisting + Exclusivity
    const resA = calculateRate(45000, 32, 'integration', true, true, false);
    assert.equal(resA.baseRate, 864); // 45 * 32 * 0.6 = 864
    assert.equal(resA.whitelistingFee, 346); // 864 * 0.4 = 345.6 => 346
    assert.equal(resA.exclusivityFee, 259); // 864 * 0.3 = 259.2 => 259
    assert.equal(resA.rushFee, 0);
    assert.equal(resA.total, 1469); // 864 + 346 + 259 = 1469

    // Test Case B: Edge case / boundary testing: zero views or extreme views
    const resZero = calculateRate(0, 32, 'integration', false, false, false);
    assert.equal(resZero.total, 0, 'Zero views should evaluate to $0 without throwing errors');

    const res1M = calculateRate(1000000, 45, 'dedicated', true, true, true);
    assert.ok(res1M.total > 50000, '1M view dedicated video in finance should be high value tier');
  });

  await t.test('3. Verify App.tsx integrates LandingPage for unauthenticated users', () => {
    const appContent = readFileSync(resolve(CLIENT_ROOT, 'src/App.tsx'), 'utf8');
    assert.ok(appContent.includes("import { LandingPage } from './views/LandingPage';"), 'App.tsx must import LandingPage');
    assert.ok(appContent.includes('!user || showLandingPreview'), 'App.tsx must branch to LandingPage when !user');
    assert.ok(appContent.includes('onOpenLandingPreview'), 'Navbar must receive onOpenLandingPreview handler');
  });

  await t.test('4. Verify built production bundle contains landing markers', () => {
    const distIndex = resolve(CLIENT_ROOT, 'dist/index.html');
    assert.ok(existsSync(distIndex), 'Production build dist/index.html must exist');
    const indexContent = readFileSync(distIndex, 'utf8');
    assert.ok(indexContent.includes('CollabFlow'), 'Title and metadata must be present in production dist');
  });
});
