// Manual mock for nodemailer to ensure consistent test shape
const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mock-123' });
const transport = { sendMail: sendMailMock };

const createTransportMock = jest.fn().mockImplementation((opts) => {
  // Log for test-time diagnostics when debugging nodemailer lifecycle
  // eslint-disable-next-line no-console
  console.log('[nodemailer mock] createTransport called with', opts ? { host: opts.host, port: opts.port } : {});
  return transport;
});

// Expose test hooks used by some tests
module.exports = {
  createTransport: createTransportMock,
  __sendMailMock: sendMailMock,
  __createTransportMock: createTransportMock,
};
