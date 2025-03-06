const fs = require('fs').promises;
const path = require('path');
const logger = require('../src/utils/logger');

async function generateCoverageSummary() {
  try {
    const coveragePath = path.join(__dirname, '../coverage/coverage-final.json');
    const coverage = JSON.parse(await fs.readFile(coveragePath, 'utf8'));

    const summary = {
      timestamp: new Date().toISOString(),
      overall: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
      files: [],
    };

    let totalStatements = 0;
    let totalBranches = 0;
    let totalFunctions = 0;
    let totalLines = 0;

    for (const [filePath, metrics] of Object.entries(coverage)) {
      const relativePath = path.relative(process.cwd(), filePath);
      const fileSummary = {
        file: relativePath,
        statements: metrics.s.pct,
        branches: metrics.b.pct,
        functions: metrics.f.pct,
        lines: metrics.l.pct,
      };

      summary.files.push(fileSummary);

      totalStatements += metrics.s.pct || 0;
      totalBranches += metrics.b.pct || 0;
      totalFunctions += metrics.f.pct || 0;
      totalLines += metrics.l.pct || 0;
    }

    const fileCount = summary.files.length;
    summary.overall = {
      statements: (totalStatements / fileCount).toFixed(2),
      branches: (totalBranches / fileCount).toFixed(2),
      functions: (totalFunctions / fileCount).toFixed(2),
      lines: (totalLines / fileCount).toFixed(2),
    };

    // Save summary
    const summaryPath = path.join(__dirname, '../coverage/summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    // Log summary
    logger.info('Coverage Summary:');
    logger.info('Overall Coverage:', summary.overall);
    logger.info('\nFiles needing attention (below 85% coverage):');

    summary.files
      .filter((file) => file.statements < 85
        || file.branches < 85
        || file.functions < 85
        || file.lines < 85)
      .forEach((file) => {
        logger.warn(`${file.file}:`, {
          statements: `${file.statements}%`,
          branches: `${file.branches}%`,
          functions: `${file.functions}%`,
          lines: `${file.lines}%`,
        });
      });
  } catch (error) {
    logger.error('Error generating coverage summary:', error);
    process.exit(1);
  }
}

generateCoverageSummary();
