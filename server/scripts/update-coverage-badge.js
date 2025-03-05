const fs = require('fs');
const path = require('path');

function getFormattedCoverage() {
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const { total } = coverage;

  return {
    statements: Math.floor(total.statements.pct),
    branches: Math.floor(total.branches.pct),
    functions: Math.floor(total.functions.pct),
    lines: Math.floor(total.lines.pct),
  };
}

function generateBadge(coverage) {
  const avgCoverage = Math.floor(
    (coverage.statements + coverage.branches + coverage.functions + coverage.lines) / 4,
  );

  const color = avgCoverage >= 90 ? 'brightgreen'
    : avgCoverage >= 80 ? 'green'
      : avgCoverage >= 70 ? 'yellowgreen'
        : avgCoverage >= 60 ? 'yellow'
          : 'red';

  return `https://img.shields.io/badge/coverage-${avgCoverage}%25-${color}`;
}

function updateBadge() {
  try {
    const coverage = getFormattedCoverage();
    const badgeUrl = generateBadge(coverage);
    const badgeDir = path.join(__dirname, '../badges');

    if (!fs.existsSync(badgeDir)) {
      fs.mkdirSync(badgeDir);
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg">
      <image href="${badgeUrl}" />
    </svg>`;

    fs.writeFileSync(path.join(badgeDir, 'coverage-badge.svg'), svgContent);
    console.log('Coverage badge updated successfully');
  } catch (error) {
    console.error('Error updating coverage badge:', error);
    process.exit(1);
  }
}

updateBadge();
