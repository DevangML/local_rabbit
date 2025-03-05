const {
  describe, expect, it, jest, beforeEach,
} = require('@jest/globals');
const AiService = require('../../../src/services/AiService');
const config = require('../../../src/config');

jest.mock('@google/generative-ai');
jest.mock('../../../src/utils/logger');

describe('AiService', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AiService();
  });

  describe('initialization', () => {
    it('should initialize with API key from config', () => {
      expect(aiService.apiKey).toBe(config.ai.geminiApiKey);
    });

    it('should handle missing API key gracefully', () => {
      const originalApiKey = config.ai.geminiApiKey;
      config.ai.geminiApiKey = '';
      const newService = new AiService();
      expect(newService.isEnabled).toBe(false);
      config.ai.geminiApiKey = originalApiKey;
    });
  });

  describe('analyzeDiff', () => {
    it('should analyze diff content', async () => {
      const mockDiff = 'diff --git a/file.js b/file.js\n+new line\n-old line';
      const mockResponse = { text: () => 'Analysis result' };
      aiService.model = { generateContent: jest.fn().mockResolvedValue(mockResponse) };

      const result = await aiService.analyzeDiff(mockDiff);
      expect(result).toBe('Analysis result');
    });

    it('should handle empty diff content', async () => {
      const result = await aiService.analyzeDiff('');
      expect(result).toBe('No changes to analyze');
    });

    it('should handle AI service errors', async () => {
      aiService.model = {
        generateContent: jest.fn().mockRejectedValue(new Error('AI error')),
      };

      await expect(aiService.analyzeDiff('test diff'))
        .rejects.toThrow('Failed to analyze diff');
    });
  });

  describe('suggestImprovements', () => {
    it('should generate improvement suggestions', async () => {
      const mockCode = 'function test() { var x = 1; }';
      const mockResponse = { text: () => 'Use const instead of var' };
      aiService.model = { generateContent: jest.fn().mockResolvedValue(mockResponse) };

      const result = await aiService.suggestImprovements(mockCode);
      expect(result).toContain('const');
    });

    it('should handle empty code input', async () => {
      const result = await aiService.suggestImprovements('');
      expect(result).toBe('No code provided for analysis');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      aiService.model = {
        generateContent: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      await expect(aiService.analyzeDiff('test'))
        .rejects.toThrow('Failed to analyze diff');
    });

    it('should handle rate limiting', async () => {
      aiService.model = {
        generateContent: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
      };

      await expect(aiService.analyzeDiff('test'))
        .rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('feature flags', () => {
    it('should respect AI feature flag', async () => {
      const originalFlag = config.ai.enableAiFeatures;
      config.ai.enableAiFeatures = false;

      const service = new AiService();
      const result = await service.analyzeDiff('test');

      expect(result).toBe('AI features are disabled');
      config.ai.enableAiFeatures = originalFlag;
    });
  });
});
