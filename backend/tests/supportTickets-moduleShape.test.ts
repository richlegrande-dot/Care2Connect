import { resolveCreateTransport } from '../src/lib/emailTransport';

describe('emailTransport resolver module-shape regression', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('works when only default.createTransport exists', () => {
    const sendMail = jest.fn();
    const defaultMock = { createTransport: jest.fn(() => ({ sendMail })) };
    jest.doMock('nodemailer', () => ({ __esModule: true, default: defaultMock }));
    // require resolver after mock
    const { resolveCreateTransport } = require('../src/lib/emailTransport');
    const createTransport = resolveCreateTransport();
    const transport = createTransport({});
    expect(typeof createTransport).toBe('function');
    expect(typeof transport.sendMail).toBe('function');
  });

  it('works when only createTransport exists', () => {
    const sendMail = jest.fn();
    const createMock = jest.fn(() => ({ sendMail }));
    jest.doMock('nodemailer', () => ({ createTransport: createMock }));
    const { resolveCreateTransport } = require('../src/lib/emailTransport');
    const createTransport = resolveCreateTransport();
    const transport = createTransport({});
    expect(typeof createTransport).toBe('function');
    expect(typeof transport.sendMail).toBe('function');
  });
});
