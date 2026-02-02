import { jest } from '@jest/globals';

export const exec = jest.fn((command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
  // Default behavior - call callback with empty results
  if (callback) {
    process.nextTick(() => {
      callback(new Error('Command not found'), '', 'command not found');
    });
  }
  return {
    stdout: null,
    stderr: null,
    stdin: null,
    stdio: [null, null, null],
    pid: 12345,
    connected: false,
    kill: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
    unref: jest.fn(),
    ref: jest.fn(),
    addListener: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeListener: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    listenerCount: jest.fn(),
    eventNames: jest.fn(),
  };
});
