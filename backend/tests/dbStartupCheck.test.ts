import { checkDatabaseStartup } from '../src/utils/dbStartupCheck';

describe('DB startup check', () => {
  it('logs actionable message on auth failure without leaking DATABASE_URL', async () => {
    const fakePrisma: any = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('password authentication failed for user "postgres"')),
    };

    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const ok = await checkDatabaseStartup(fakePrisma);

    expect(ok).toBe(false);
    expect(errSpy).toHaveBeenCalled();

    const calledWith = errSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(calledWith).toMatch(/DB auth failed\s*[-—]\s*check DATABASE_URL password vs container POSTGRES_PASSWORD/i);

    errSpy.mockRestore();
  });
});
