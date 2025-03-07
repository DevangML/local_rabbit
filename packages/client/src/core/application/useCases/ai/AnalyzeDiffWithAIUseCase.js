/**
 * Use case for analyzing diffs with AI
 */
export class AnalyzeDiffWithAIUseCase {
  /**
   * Constructor
   * @param { Object } aiService - AI service
   * @param { Object } diffRepository - Diff repository
   */
  constructor(aiService, diffRepository) {
  this.aiService = aiService;
  this.diffRepository = diffRepository;
  }

  /**
   * Execute the use case
   * @param { string } repositoryId - Repository ID
   * @param { string } fromBranch - Source branch
   * @param { string } toBranch - Target branch
   * @param { string } prompt - User prompt
   * @returns { Promise<Object> } - AI analysis result
   */
  async execute(repositoryId, fromBranch, toBranch, prompt) {
  // First, get the diff
  const diff = await this.diffRepository.getDiff(repositoryId, fromBranch, toBranch);
  
  // Then, analyze it with AI
  const analysis = await this.aiService.analyzeDiff(diff, prompt);
  
  return {
  diff,
  analysis
  };
  }
} 