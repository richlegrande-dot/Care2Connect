import { demoSafeMode } from '../../src/monitoring/demoSafeMode';
import net from 'net';

// Mock net.createServer
jest.mock('net');
const mockNet = net as jest.Mocked<typeof net>;

describe('Demo Safe Mode', () => {
  let mockServer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the demoSafeMode instance state
    (demoSafeMode as any).config = {
      enabled: true,
      requestedPort: 3001,
      actualPort: 3001,
      portAutoSelected: false,
      disabledServices: [],
    };
    process.env.DEMO_SAFE_MODE = 'true';
    process.env.PORT = '3001';

    // Create a mock server with all needed methods
    mockServer = {
      listen: jest.fn(),
      close: jest.fn(),
      once: jest.fn(),
      on: jest.fn(),
    };
    
    mockNet.createServer.mockReturnValue(mockServer as any);
  });

  describe('setup', () => {
    it('should return requested port if available', async () => {
      process.env.PORT = '3001';

      // Mock port as available - server.once('listening') is called
      mockServer.listen.mockImplementation((port: number) => {
        // Simulate successful listening
        setTimeout(() => {
          const listenCallback = mockServer.once.mock.calls.find(call => call[0] === 'listening')?.[1];
          if (listenCallback) {
            listenCallback();
          }
        }, 0);
      });

      mockServer.close.mockImplementation(() => {
        // Server closes successfully
      });

      const port = await demoSafeMode.setup();
      expect(port).toBe(3001);
    });

    it('should find next available port if requested port in use', async () => {
      process.env.PORT = '3001';

      let storedErrorCallback: ((error: Error) => void) | null = null;
      let storedListenCallback: (() => void) | null = null;
      
      // Mock once to store callbacks
      mockServer.once.mockImplementation((event: string, callback: any) => {
        if (event === 'error') {
          storedErrorCallback = callback;
        } else if (event === 'listening') {
          storedListenCallback = callback;
        }
      });

      mockServer.listen.mockImplementation((port: number) => {
        setTimeout(() => {
          if (port === 3001) {
            // First port fails
            if (storedErrorCallback) {
              const error = new Error('EADDRINUSE');
              (error as any).code = 'EADDRINUSE';
              storedErrorCallback(error);
            }
          } else {
            // Second port succeeds  
            if (storedListenCallback) {
              storedListenCallback();
            }
          }
        }, 10);
      });

      mockServer.close.mockImplementation(() => {
        // Server closes successfully
      });

      const port = await demoSafeMode.setup();
      expect(port).toBe(3002);
    }, 10000);

    it('should try up to 10 ports', async () => {
      process.env.PORT = '3001';

      let storedErrorCallback: ((error: Error) => void) | null = null;
      
      // Mock once to store error callback
      mockServer.once.mockImplementation((event: string, callback: any) => {
        if (event === 'error') {
          storedErrorCallback = callback;
        }
      });

      mockServer.listen.mockImplementation((port: number) => {
        setTimeout(() => {
          // All ports fail
          if (storedErrorCallback) {
            const error = new Error('EADDRINUSE');
            (error as any).code = 'EADDRINUSE';
            storedErrorCallback(error);
          }
        }, 10);
      });

      mockServer.close.mockImplementation(() => {
        // Server closes successfully
      });

      await expect(demoSafeMode.setup()).rejects.toThrow('Could not find available port');
    }, 10000);
  });

  describe('getStatus', () => {
    it('should return demo status with port info', () => {
      process.env.DEMO_SAFE_MODE = 'true';
      process.env.PORT = '3001';
      process.env.FRONTEND_URL = 'http://localhost:3003';

      // Set port info (normally done by setup)
      (demoSafeMode as any).config.requestedPort = 3001;
      (demoSafeMode as any).config.actualPort = 3002;
      (demoSafeMode as any).config.portAutoSelected = true;
      (demoSafeMode as any).config.enabled = true;

      const status = demoSafeMode.getStatus();

      expect(status.demoModeEnabled).toBe(true);
      expect(status.requestedPort).toBe(3001);
      expect(status.actualPort).toBe(3002);
      expect(status.portAutoSelected).toBe(true);
      expect(status.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('Port auto-selected')
      ]));
    });

    it('should show service status', () => {
      process.env.DEMO_SAFE_MODE = 'true';
      process.env.STRIPE_SECRET_KEY = '';

      const status = demoSafeMode.getStatus();

      expect(status.services.stripe.enabled).toBe(false);
      expect(status.services.stripe.reason).toBe('NO_KEYS_MODE');
      // SMTP is archived, so no smtp property expected
      expect(status.services.smtp).toBeUndefined();
    });

    it('should show Stripe enabled when configured', () => {
      process.env.DEMO_SAFE_MODE = 'true';
      process.env.NO_KEYS_MODE = 'false';
      process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';

      const status = demoSafeMode.getStatus();

      expect(status.services.stripe.enabled).toBe(true);
    });

    it('should include warnings for disabled services', () => {
      process.env.DEMO_SAFE_MODE = 'true';
      process.env.STRIPE_SECRET_KEY = '';

      // Set up disabled services
      (demoSafeMode as any).config.disabledServices = ['Stripe (card payments) - QR donations will work'];

      const status = demoSafeMode.getStatus();

      expect(status.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('no-keys mode')
      ]));
    });
  });

  describe('displayBanner', () => {
    it('should log demo banner', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      process.env.DEMO_SAFE_MODE = 'true';
      process.env.PORT = '3001';
      (demoSafeMode as any).config.enabled = true;
      (demoSafeMode as any).config.actualPort = 3001;

      demoSafeMode.displayBanner();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEMO MODE ACTIVE')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3001')
      );

      consoleSpy.mockRestore();
    });

    it('should not display banner when demo mode disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      process.env.DEMO_SAFE_MODE = 'false';
      (demoSafeMode as any).config.enabled = false;

      demoSafeMode.displayBanner();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
