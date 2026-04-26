import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';

describe('PermissionGuard', () => {
  let reflector: { get: jest.Mock };
  let guard: PermissionGuard;

  function createContext(permissions: string[] = []) {
    return {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { permissions },
        }),
      }),
    } as any;
  }

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    };

    guard = new PermissionGuard(reflector as unknown as Reflector);
  });

  it('should allow access when no permissions are required', () => {
    reflector.get.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should allow access when the user has all required permissions', () => {
    reflector.get.mockReturnValue(['read', 'write']);

    expect(guard.canActivate(createContext(['read', 'write', 'delete']))).toBe(
      true,
    );
  });

  it('should deny access when a required permission is missing', () => {
    reflector.get.mockReturnValue(['read', 'write']);

    expect(guard.canActivate(createContext(['read']))).toBe(false);
  });
});
