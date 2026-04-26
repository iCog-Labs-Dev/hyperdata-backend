import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  function createHost(
    response: { status: jest.Mock },
    url = '/users',
  ): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ url }),
      }),
    } as ArgumentsHost;
  }

  it('should format HttpException responses', () => {
    const json = jest.fn();
    const response = {
      status: jest.fn().mockReturnValue({ json }),
    };
    const exception = new HttpException(
      { message: 'Invalid request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, createHost(response));

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request',
        code: HttpStatus.BAD_REQUEST,
        data: null,
        path: '/users',
      }),
    );
  });

  it('should format unknown errors as internal server errors', () => {
    const json = jest.fn();
    const response = {
      status: jest.fn().mockReturnValue({ json }),
    };

    filter.catch(new Error('boom'), createHost(response, '/health'));

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        path: '/health',
      }),
    );
  });
});
