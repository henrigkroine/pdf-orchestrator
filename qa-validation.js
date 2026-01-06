const fs = require('fs');

// Check both HTML files
const files = ['teei-aws-partnership-executive.html', 'teei-aws-partnership-amazing.html'];

files.forEach(file => {
  console.log('\n=== ANALYZING:', file, '===\n');
  const html = fs.readFileSync('exports/' + file, 'utf8');

  // Critical metrics
  const metrics = {
    'Document title': html.includes('Transforming Education') || html.includes('TEEI AWS Partnership'),
    'Real metrics (no XX)': !(/XX\+?/.test(html)),
    'Complete CTA text': /Ready to [^<]{15,}/.test(html),
    'Contact email': /partnerships@teei\.org|partnerships@theeducationalequalityinstitute\.org/.test(html),
    'Uses Lora font': /Lora/.test(html),
    'Uses Roboto Flex': /Roboto Flex/.test(html),
    'Nordshore color': /#00393F/i.test(html),
    'Sky color': /#C9E4EC/i.test(html),
    'Gold accent': /#BA8F5A/i.test(html),
    'No copper orange main': !(/color:\s*#FF6|color:\s*#C87/.test(html)),
    'Grid layout': /grid-template-columns/.test(html),
    'Responsive spacing': /var\(--space|space-xl|space-lg/.test(html),
    '8.5x11 page size': /8\.5in/.test(html) && /11in/.test(html),
    'Print styles': /@media print/.test(html),
    'Heading hierarchy': /<h1/.test(html) && /<h2/.test(html),
    'Alt text on images': /<img[^>]+alt=/.test(html),
    'Semantic HTML lang': /<html[^>]+lang=/.test(html),
    'CSS Grid system': /grid-template-columns/.test(html),
    'Consistent margins': /padding|margin/.test(html),
    'Professional polish': !/TODO|FIXME|XXX|lorem ipsum/i.test(html)
  };

  let passCount = 0;
  let totalCount = 0;
  Object.entries(metrics).forEach(([check, pass]) => {
    const status = pass ? '✓ PASS' : '✗ FAIL';
    console.log('  ' + check.padEnd(30), status);
    if (pass) passCount++;
    totalCount++;
  });

  const score = Math.round((passCount / totalCount) * 100);
  console.log('\n📊 QA SCORE:', score + '/100');

  if (score >= 95) {
    console.log('✅ WORLD-CLASS QUALITY - Ready for production!');
  } else if (score >= 85) {
    console.log('⚠️  HIGH QUALITY - Minor improvements needed');
  } else if (score >= 75) {
    console.log('⚠️  GOOD - Several improvements needed');
  } else {
    console.log('❌ NEEDS WORK - Critical issues to fix');
  }
});
