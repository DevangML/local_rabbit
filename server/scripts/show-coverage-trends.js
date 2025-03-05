const fs = require('fs').promises;
const path = require('path');
const logger = require('../src/utils/logger');

async function showCoverageTrends() {
  try {
    const historyPath = path.join(__dirname, '../coverage/history.json');
    const history = JSON.parse(await fs.readFile(historyPath, 'utf8'));

    // Calculate trends
    const trends = history.reduce((acc, entry, index) => {
      if (index === 0) {
        acc.push({
          timestamp: entry.timestamp,
          coverage: entry.coverage,
          change: { statements: 0, branches: 0, functions: 0 },
        });
      } else {
        const previous = history[index - 1].coverage;
        acc.push({
          timestamp: entry.timestamp,
          coverage: entry.coverage,
          change: {
            statements: (entry.coverage.statements - previous.statements).toFixed(2),
            branches: (entry.coverage.branches - previous.branches).toFixed(2),
            functions: (entry.coverage.functions - previous.functions).toFixed(2),
          },
        });
      }
      return acc;
    }, []);

    // Log trends
    logger.info('Coverage Trends:\n');
    trends.forEach((entry) => {
      logger.info(`${new Date(entry.timestamp).toLocaleDateString()}:`, {
        coverage: entry.coverage,
        change: entry.change,
      });
    });

    // Calculate overall trend
    const firstEntry = history[0].coverage;
    const lastEntry = history[history.length - 1].coverage;
    const overallTrend = {
      statements: (lastEntry.statements - firstEntry.statements).toFixed(2),
      branches: (lastEntry.branches - firstEntry.branches).toFixed(2),
      functions: (lastEntry.functions - firstEntry.functions).toFixed(2),
    };

    logger.info('\nOverall Trend:', overallTrend);
  } catch (error) {
    logger.error('Error showing coverage trends:', error);
    process.exit(1);
  }
}

showCoverageTrends();
