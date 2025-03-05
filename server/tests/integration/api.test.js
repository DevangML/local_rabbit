const {
  describe, it, before, after,
} = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const path = require('path');
const fs = require('fs-extra');
const app = require('../../src/app');
const GitService = require('../../src/services/GitService');

jest.mock('../../src/services/GitService');

describe('API Integration Tests', () => {
  const TEST_REPO_PATH = path.join(__dirname, '../fixtures/test-repo');
  const testRepoPath = path.join(__dirname, '../fixtures/mock-repo');

  before(async () => {
    // Set up test repository
    await fs.ensureDir(TEST_REPO_PATH);
    // Initialize git repo and add test files
  });

  after(async () => {
    // Clean up test repository
    await fs.remove(TEST_REPO_PATH);
  });

  describe('Repository Endpoints', () => {
    describe('GET /api/repositories', () => {
      it('should return list of repositories', async () => {
        const mockRepos = [
          { path: '/test/repo1', name: 'repo1' },
          { path: '/test/repo2', name: 'repo2' },
        ];

        GitService.findRepositories.mockResolvedValue(mockRepos);

        const response = await request(app)
          .get('/api/repositories')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(mockRepos);
      });

      it('should handle errors', async () => {
        GitService.findRepositories.mockRejectedValue(new Error('Test error'));

        await request(app)
          .get('/api/repositories')
          .expect('Content-Type', /json/)
          .expect(500)
          .then((response) => {
            expect(response.body.error).toBeDefined();
          });
      });
    });

    describe('POST /api/repository/set', () => {
      const validRepoPath = path.join(__dirname, '../../');

      beforeEach(() => {
        GitService.prototype.isValidRepo = jest.fn().mockResolvedValue(true);
        GitService.prototype.getBranches = jest.fn().mockResolvedValue({ all: ['main'] });
        GitService.prototype.getCurrentBranch = jest.fn().mockResolvedValue('main');
      });

      it('should set repository path', async () => {
        await request(app)
          .post('/api/repository/set')
          .send({ path: validRepoPath })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.path).toBe(validRepoPath);
            expect(response.body.branches).toEqual(['main']);
            expect(response.body.current).toBe('main');
          });
      });

      it('should reject invalid repository path', async () => {
        GitService.prototype.isValidRepo.mockResolvedValue(false);

        await request(app)
          .post('/api/repository/set')
          .send({ path: '/invalid/path' })
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body.error).toBe('Not a valid git repository');
          });
      });
    });

    describe('GET /api/repository/branches', () => {
      it('should return branches for current repository', async () => {
        // First set the repository
        await request(app)
          .post('/api/repository/set')
          .send({ path: testRepoPath });

        const response = await request(app)
          .get('/api/repository/branches')
          .expect(200);

        expect(response.body).to.have.property('branches');
        expect(response.body).to.have.property('current');
      });
    });

    describe('POST /api/diff/analyze', () => {
      it('should analyze diff between branches', async () => {
        // First set the repository
        await request(app)
          .post('/api/repository/set')
          .send({ path: testRepoPath });

        const response = await request(app)
          .post('/api/diff/analyze')
          .send({
            fromBranch: 'main',
            toBranch: 'develop',
          })
          .expect(200);

        expect(response.body).to.have.property('analysis');
      });
    });
  });
});
