const fs = require('fs');
const path = require('path');

function readCoverageData() {
  const coveragePath = path.join(__dirname, '../coverage/coverage-final.json');
  if (!fs.existsSync(coveragePath)) {
    console.error('No coverage data found. Run tests with coverage first.');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  return calculateTotalCoverage(coverage);
}

function calculateTotalCoverage(coverage) {
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  Object.values(coverage).forEach(file => {
    // Statements
    totalStatements += file.s.total;
    coveredStatements += file.s.covered;
    // Branches
    totalBranches += file.b.total;
    coveredBranches += file.b.covered;
    // Functions
    totalFunctions += file.f.total;
    coveredFunctions += file.f.covered;
  });

  return {
    statements: (coveredStatements / totalStatements * 100).toFixed(2),
    branches: (coveredBranches / totalBranches * 100).toFixed(2),
    functions: (coveredFunctions / totalFunctions * 100).toFixed(2)
  };
}

const coverage = readCoverageData();
console.log('\nTest Coverage Summary:');
console.log('---------------------');
console.log(`Statements : ${coverage.statements}%`);
console.log(`Branches   : ${coverage.branches}%`);
console.log(`Functions  : ${coverage.functions}%`);
