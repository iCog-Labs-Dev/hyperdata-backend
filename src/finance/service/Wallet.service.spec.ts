import { BadRequestException } from '@nestjs/common';
import { WalletService } from './Wallet.service';

describe('WalletService.reserveWithdrawal', () => {
  const createService = () => {
    const walletRepository = {};
    const santimPayService = {};
    const transactionService = {
      create: jest.fn().mockResolvedValue({ id: 'transaction-id' }),
    };
    const paginationService = {};
    const dataSource = {};
    return {
      service: new WalletService(
        walletRepository as any,
        santimPayService as any,
        transactionService as any,
        paginationService as any,
        dataSource as any,
      ),
      transactionService,
    };
  };

  it('rejects negative withdrawal amounts before creating a transaction', async () => {
    const { service, transactionService } = createService();
    const queryRunner = { manager: {} } as any;

    await expect(
      service.reserveWithdrawal(
        'user-id',
        -1,
        '+251911234567',
        'Telebirr',
        queryRunner,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transactionService.create).not.toHaveBeenCalled();
  });

  it('reserves funds under the wallet transaction lock', async () => {
    const { service, transactionService } = createService();
    const wallet = { balance: 100 };
    const queryRunner = {
      manager: {
        findOne: jest.fn().mockResolvedValue(wallet),
        save: jest.fn().mockResolvedValue(wallet),
      },
    } as any;

    await service.reserveWithdrawal(
      'user-id',
      25,
      '+251911234567',
      'Telebirr',
      queryRunner,
    );

    expect(queryRunner.manager.findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
    expect(wallet.balance).toBe(75);
    expect(transactionService.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -25, status: 'Reserved' }),
      queryRunner,
    );
  });
});
