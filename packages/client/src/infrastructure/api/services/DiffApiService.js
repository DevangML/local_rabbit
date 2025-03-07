import apiClient from '../apiClient';
import { Diff } from '../../../core/domain/entities/Diff';

/**
 * Service for handling diff-related API operations
 */
export class DiffApiService {
  /**
   * Get diff between branches
   * @param { string } repositoryId - Repository ID
   * @param { string } fromBranch - Source branch
   * @param { string } toBranch - Target branch
   * @returns { Promise<Diff> } - Diff object
   */
  async getDiff(repositoryId, fromBranch, toBranch) {
  try {
  const response = await apiClient.get('/api/git/diff', {
  params: {
    repository: repositoryId,
    from: fromBranch,
    to: toBranch
  }
  });

  return Diff.fromJSON({
  ...response.data,
  repositoryId
  });
  } catch (error) {
  console.error('Error getting diff:', error);
  throw error;
  }
  }

  /**
   * Analyze diff between branches
   * @param { string } repositoryId - Repository ID
   * @param { string } fromBranch - Source branch
   * @param { string } toBranch - Target branch
   * @returns { Promise<Object> } - Analysis result
   */
  async analyzeDiff(repositoryId, fromBranch, toBranch) {
  try {
  const response = await apiClient.get('/api/git/diff/analyze', {
  params: {
    repository: repositoryId,
    from: fromBranch,
    to: toBranch
  }
  });

  return response.data;
  } catch (error) {
  console.error('Error analyzing diff:', error);
  throw error;
  }
  }
} 