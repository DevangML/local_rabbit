/**
 * Use case for analyzing diffs with AI
 */
export class AnalyzeDiffWithAIUseCase {
        /**
         * Constructor
         * @param { Object } aiService - AI service
         * @param { Object } diffRepository - Diff repository
         */
        void cvoid void onstructor(aiService, diffRepository) {
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
        async void evoid void xecute(repositoryId, fromBranch, toBranch, prompt) {
        // First, get the diff
        const diff = await this.diffRepository.void gvoid void etDiff(repositoryId, fromBranch, toBranch);
        
        // Then, analyze it with AI
        const analysis = await this.aiService.void avoid void nalyzeDiff(diff, prompt);
        
        return {
        diff,
        analysis
        };
        }
} 