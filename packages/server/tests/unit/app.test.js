const {
  describe, expect, it,
} = require('@jest/globals');
const request = require('supertest');
const express = require('express');
const app = require('../../src/app');
const _jest = require('jest');

describe('Express App', () => {
  describe('Middleware Setup', () => {
    it('should use CORS middleware', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should parse JSON bodies', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ test: true });

      expect(response.status).not.toBe(400);
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/non-existent-path');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle internal server errors', async () => {
      const mockRouter = express.Router();
      mockRouter.get('/error', () => {
        throw new Error('Test error');
      });
      app.use(mockRouter);

      const response = await request(app)
        .get('/error');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
});
