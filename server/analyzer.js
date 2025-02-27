const path = require('path');
const fs = require('fs').promises;

class CodeAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  async analyzeImpact(diffFiles, fromBranch, toBranch, gitService) {
    // Filter for Dart files only
    const dartFiles = diffFiles.filter(file => file.path.endsWith('.dart'));
    
    const analysis = {
      summary: {
        totalFiles: dartFiles.length,
        totalAdditions: dartFiles.reduce((sum, file) => sum + file.additions, 0),
        totalDeletions: dartFiles.reduce((sum, file) => sum + file.deletions, 0),
        byType: {},
        stateManagement: {
          stateful: 0,
          stateless: 0,
          bloc: 0,
          provider: 0
        }
      },
      files: dartFiles.map(file => {
        // Determine impact level based on changes and file type
        const changeSize = file.additions + file.deletions;
        let impactLevel;
        
        if (file.type === 'model' || file.type === 'service') {
          impactLevel = changeSize > 50 ? 'high' : (changeSize > 20 ? 'medium' : 'low');
        } else {
          impactLevel = changeSize > 100 ? 'high' : (changeSize > 50 ? 'medium' : 'low');
        }
        
        return {
          path: file.path,
          type: file.type,
          impactLevel: impactLevel,
          changes: {
            additions: file.additions,
            deletions: file.deletions,
            total: file.additions + file.deletions
          },
          analysis: file.analysis
        };
      }),
      risks: []
    };
    
    // Update summary statistics
    for (const file of dartFiles) {
      analysis.summary.byType[file.type] = (analysis.summary.byType[file.type] || 0) + 1;
      
      if (file.analysis?.stateManagement) {
        if (file.analysis.stateManagement.isStateful) {
          analysis.summary.stateManagement.stateful++;
        }
        if (file.analysis.widgets?.includes('StatelessWidget')) {
          analysis.summary.stateManagement.stateless++;
        }
        if (file.analysis.stateManagement.usesBloc) {
          analysis.summary.stateManagement.bloc++;
        }
        if (file.analysis.stateManagement.usesProvider) {
          analysis.summary.stateManagement.provider++;
        }
      }
      
      // Add risks based on file analysis
      this.analyzeRisks(file, analysis.risks);
    }
    
    return analysis;
  }

  async analyzeQuality(diffFiles, fromBranch, toBranch, gitService) {
    // Filter for Dart files
    const dartFiles = diffFiles.filter(file => file.path.endsWith('.dart'));
    
    const qualityData = {
      summary: {
        totalFiles: dartFiles.length,
        overallScore: 0,
        testCoverage: 0,
        complexityScore: 0
      },
      files: dartFiles.map(file => {
        // Calculate complexity score based on the analysis
        const complexityScore = file.analysis?.complexity?.widgetNesting || 0;
        const stateVariables = file.analysis?.complexity?.stateVariables || 0;
        const totalScore = complexityScore + (stateVariables * 0.5);
        
        // Determine quality assessment
        let assessment;
        if (totalScore < 3) {
          assessment = 'Good';
        } else if (totalScore < 6) {
          assessment = 'Moderate';
        } else {
          assessment = 'Needs Improvement';
        }
        
        return {
          path: file.path,
          type: file.type,
          metrics: {
            complexity: complexityScore,
            stateVariables: stateVariables,
            totalScore: totalScore
          },
          assessment: assessment,
          details: [
            { name: 'Widget Nesting', value: complexityScore, threshold: 3 },
            { name: 'State Variables', value: stateVariables, threshold: 5 }
          ]
        };
      }),
      recommendations: []
    };
    
    // Calculate overall score from individual files
    if (qualityData.files.length > 0) {
      qualityData.summary.overallScore = qualityData.files.reduce((sum, file) => 
        sum + file.metrics.totalScore, 0) / qualityData.files.length;
    }
    
    // Generate recommendations
    qualityData.recommendations = this.generateQualityRecommendations(qualityData);
    
    return qualityData;
  }

  analyzeRisks(file, risks) {
    const metadata = file.analysis || {};

    // Check for large changes
    if (file.additions + file.deletions > 100) {
      risks.push({
        level: 'high',
        type: 'large_change',
        file: file.path,
        message: 'Large number of changes may need careful review'
      });
    }

    // Check state management changes
    if (metadata.stateManagement?.isStateful) {
      risks.push({
        level: 'medium',
        type: 'state_management',
        file: file.path,
        message: 'Changes to state management may affect app behavior'
      });
    }

    // Check missing tests
    if ((file.type === 'widget' || file.type === 'screen') && 
        !file.path.includes('_test.dart') && 
        !file.path.includes('/test/')) {
      risks.push({
        level: 'medium',
        type: 'missing_tests',
        file: file.path,
        message: 'Widget or screen changes without corresponding tests'
      });
    }
  }

  generateQualityRecommendations(analysis) {
    const recommendations = [];

    // Handle quality analysis recommendations
    if (analysis.summary.overallScore > 5) {
      recommendations.push({
        priority: 'high',
        message: 'Consider refactoring complex widgets',
        details: 'High complexity score indicates potential maintenance issues'
      });
    }

    // Check for files with high complexity
    const complexFiles = analysis.files.filter(file => file.metrics.complexity > 3);
    if (complexFiles.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: 'Reduce widget nesting depth',
        details: `${complexFiles.length} files have high widget nesting`
      });
    }

    // Check for files with many state variables
    const stateHeavyFiles = analysis.files.filter(file => file.metrics.stateVariables > 5);
    if (stateHeavyFiles.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: 'Improve state management',
        details: `${stateHeavyFiles.length} files have many state variables`
      });
    }

    return recommendations;
  }

  async genericReview(diffFiles, fromBranch, toBranch, gitService) {
    try {
      // Filter for Dart files
      const dartFiles = diffFiles.filter(file => file.path.endsWith('.dart'));
      
      const reviewData = dartFiles.map(file => {
        const comments = [];
        
        // Generate comments based on file analysis
        if (file.analysis) {
          // Check for large widget nesting
          if (file.analysis.complexity?.widgetNesting > 3) {
            comments.push({
              type: 'warning',
              line: 1, // Default to line 1 since we don't have line-specific info
              message: `High widget nesting depth (${file.analysis.complexity.widgetNesting}) may impact performance and readability.`
            });
          }
          
          // Check for stateful widgets without proper state management
          if (file.analysis.stateManagement?.isStateful && 
              !file.analysis.stateManagement?.usesBloc && 
              !file.analysis.stateManagement?.usesProvider) {
            comments.push({
              type: 'suggestion',
              line: 1,
              message: 'Consider using state management solutions like BLoC or Provider for better state organization.'
            });
          }
          
          // If it has many state variables
          if (file.analysis.complexity?.stateVariables > 5) {
            comments.push({
              type: 'info',
              line: 1,
              message: `This widget has ${file.analysis.complexity.stateVariables} state variables. Consider refactoring to reduce state complexity.`
            });
          }
          
          // Check for debug statements
          const debugStatements = file.chunks?.some(chunk => 
            chunk.lines.some(line => 
              line.content.includes('print(') || 
              line.content.includes('debugPrint(') || 
              line.content.includes('console.log(')
            )
          );
          
          if (debugStatements) {
            comments.push({
              type: 'warning',
              line: 1,
              message: 'Debug print statements found. Consider removing before production.'
            });
          }
          
          // Check for TODOs
          const todoStatements = file.chunks?.some(chunk => 
            chunk.lines.some(line => 
              line.content.includes('TODO') || 
              line.content.includes('FIXME')
            )
          );
          
          if (todoStatements) {
            comments.push({
              type: 'info',
              line: 1,
              message: 'TODO or FIXME comments found. Consider addressing these items.'
            });
          }
        }
        
        return {
          file: file.path,
          comments: comments
        };
      }).filter(fileReview => fileReview.comments.length > 0);
      
      return reviewData;
    } catch (error) {
      console.error('Error in generic review:', error);
      throw error;
    }
  }
}

module.exports = CodeAnalyzer;