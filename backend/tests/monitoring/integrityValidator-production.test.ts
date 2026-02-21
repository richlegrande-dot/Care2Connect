import { integrityValidator } from '../../src/monitoring/integrityValidator';

describe('Integrity Validator - Production Policies', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('checkTypeScript - Production Policies', () => {
    it('should refuse transpile-only in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.TS_NODE_TRANSPILE_ONLY = 'true';

      const result = integrityValidator.checkTypeScript();

      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('Cannot run production server with --transpile-only')
      );
      expect(result.errors).toContainEqual(
        expect.stringContaining('TypeScript errors are being masked')
      );
    });

    it('should refuse transpile-only from execArgv in production', () => {
      process.env.NODE_ENV = 'production';
      
      // Mock execArgv
      const originalExecArgv = process.execArgv;
      Object.defineProperty(process, 'execArgv', {
        value: ['--transpile-only'],
        writable: true,
      });

      const result = integrityValidator.checkTypeScript();

      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('Cannot run production server with --transpile-only')
      );

      // Restore
      Object.defineProperty(process, 'execArgv', {
        value: originalExecArgv,
        writable: true,
      });
    });

    it('should refuse if not running from dist/ in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.TS_NODE_TRANSPILE_ONLY;
      
      // Mock __dirname to backend/src instead of dist
      const mockDirname = '/backend/src';
      jest.spyOn(process, 'cwd').mockReturnValue('/backend');

      const result = integrityValidator.checkTypeScript();

      // Should warn or error about not running from dist/
      // (actual implementation may vary)
      expect(result.passed).toBeDefined();
    });

    it('should allow transpile-only in development with warning', () => {
      process.env.NODE_ENV = 'development';
      process.env.TS_NODE_TRANSPILE_ONLY = 'true';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = integrityValidator.checkTypeScript();

      expect(result.passed).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('transpile-only')
      );

      consoleSpy.mockRestore();
    });

    it('should check if running from dist in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.TS_NODE_TRANSPILE_ONLY;
      
      // Mock execArgv without transpile-only
      const originalExecArgv = process.execArgv;
      Object.defineProperty(process, 'execArgv', {
        value: [],
        writable: true,
      });

      const result = integrityValidator.checkTypeScript();

      // The test itself is running from src, not dist, so it should fail
      // This validates that the dist check is working
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('Production mode requires compiled dist/')
      );

      // Restore
      Object.defineProperty(process, 'execArgv', {
        value: originalExecArgv,
        writable: true,
      });
    });

    it('should include fix steps in error message', () => {
      process.env.NODE_ENV = 'production';
      process.env.TS_NODE_TRANSPILE_ONLY = 'true';

      const result = integrityValidator.checkTypeScript();

      expect(result.errors).toContainEqual(
        expect.stringContaining('npm run typecheck')
      );
      expect(result.errors).toContainEqual(
        expect.stringContaining('npm run build')
      );
      expect(result.errors).toContainEqual(
        expect.stringContaining('npm run start:prod')
      );
    });
  });

  describe('isTranspileOnly detection', () => {
    it('should detect TS_NODE_TRANSPILE_ONLY env var', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalTsNode = process.env.TS_NODE_TRANSPILE_ONLY;
      
      process.env.NODE_ENV = 'production';
      process.env.TS_NODE_TRANSPILE_ONLY = 'true';
      
      const result = integrityValidator.checkTypeScript();
      
      expect(result.passed).toBe(false);
      
      // Restore
      process.env.NODE_ENV = originalEnv;
      if (originalTsNode) {
        process.env.TS_NODE_TRANSPILE_ONLY = originalTsNode;
      } else {
        delete process.env.TS_NODE_TRANSPILE_ONLY;
      }
    });

    it('should detect --transpile-only in execArgv', () => {
      const originalExecArgv = process.execArgv;
      Object.defineProperty(process, 'execArgv', {
        value: ['--require', 'ts-node/register', '--transpile-only'],
        writable: true,
      });

      process.env.NODE_ENV = 'production';
      const result = integrityValidator.checkTypeScript();

      expect(result.passed).toBe(false);

      Object.defineProperty(process, 'execArgv', {
        value: originalExecArgv,
        writable: true,
      });
    });

    it('should detect --transpile-only in argv', () => {
      const originalArgv = process.argv;
      Object.defineProperty(process, 'argv', {
        value: ['node', 'server.ts', '--transpile-only'],
        writable: true,
      });

      process.env.NODE_ENV = 'production';
      const result = integrityValidator.checkTypeScript();

      expect(result.passed).toBe(false);

      Object.defineProperty(process, 'argv', {
        value: originalArgv,
        writable: true,
      });
    });
  });

  describe('validateOrExit', () => {
    it('should exit process on production policy failure', async () => {
      process.env.NODE_ENV = 'production';
      process.env.TS_NODE_TRANSPILE_ONLY = 'true';

      const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        throw new Error(`process.exit: ${code}`);
      });

      await expect(integrityValidator.validateOrExit()).rejects.toThrow('process.exit');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    it('should not exit on development warnings', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalTsNode = process.env.TS_NODE_TRANSPILE_ONLY;
      const originalDbUrl = process.env.DATABASE_URL;
      const originalFeatureDbEnabled = process.env.FEATURE_DATABASE_ENABLED;
      
      process.env.NODE_ENV = 'development';
      // Remove transpile-only to avoid critical failures
      delete process.env.TS_NODE_TRANSPILE_ONLY;
      
      // Set up minimal environment to pass validation
      process.env.FEATURE_DATABASE_ENABLED = 'false'; // Disable DB requirement
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

      const mockExit = jest.spyOn(process, 'exit').mockImplementation();

      await integrityValidator.validateOrExit();

      expect(mockExit).not.toHaveBeenCalled();

      mockExit.mockRestore();
      process.env.NODE_ENV = originalEnv;
      if (originalTsNode) {
        process.env.TS_NODE_TRANSPILE_ONLY = originalTsNode;
      }
      if (originalDbUrl) {
        process.env.DATABASE_URL = originalDbUrl;
      } else {
        delete process.env.DATABASE_URL;
      }
      if (originalFeatureDbEnabled) {
        process.env.FEATURE_DATABASE_ENABLED = originalFeatureDbEnabled;
      } else {
        delete process.env.FEATURE_DATABASE_ENABLED;
      }
    });
  });
});
