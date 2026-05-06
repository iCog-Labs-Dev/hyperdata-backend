import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  DiskHealthIndicator,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let health: { check: jest.Mock };
  let http: { pingCheck: jest.Mock };
  let disk: { checkStorage: jest.Mock };
  let db: { pingCheck: jest.Mock };

  beforeEach(async () => {
    health = { check: jest.fn() };
    http = { pingCheck: jest.fn() };
    disk = { checkStorage: jest.fn() };
    db = { pingCheck: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: health },
        { provide: HttpHealthIndicator, useValue: http },
        { provide: DiskHealthIndicator, useValue: disk },
        { provide: TypeOrmHealthIndicator, useValue: db },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should run the configured health checks', async () => {
    const pingHttp = { nestjsDocs: 'ok' };
    const pingDb = { database: 'ok' };
    const diskStatus = { storage: 'ok' };

    http.pingCheck.mockResolvedValue(pingHttp);
    db.pingCheck.mockResolvedValue(pingDb);
    disk.checkStorage.mockResolvedValue(diskStatus);
    health.check.mockImplementation(
      async (checks: Array<() => Promise<unknown>>) => {
        const results = await Promise.all(checks.map((check) => check()));
        return { status: 'ok', results };
      },
    );

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      results: [pingHttp, pingDb, diskStatus],
    });

    expect(http.pingCheck).toHaveBeenCalledWith(
      'nestjs-docs',
      'https://docs.nestjs.com',
    );
    expect(db.pingCheck).toHaveBeenCalledWith('database');
    expect(disk.checkStorage).toHaveBeenCalledWith('storage', {
      path: '/',
      thresholdPercent: 0.5,
    });
  });
});
