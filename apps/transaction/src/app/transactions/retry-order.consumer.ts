import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { TransactionsService } from './transactions.service';
import { ConfigService } from '@nestjs/config';
import { QUEUE_FOREX_RETRY, RetryOrderEvent } from './retry-order.producer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import { Logger } from '@nestjs/common';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';

@Processor(QUEUE_FOREX_RETRY)
export class RetryOrderConsumer extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly transactionService: TransactionsService,
    private readonly configService: ConfigService,
    @InjectRepository(ForexOrder)
    private readonly forexOrderRepo: Repository<ForexOrder>,
    @InjectRepository(ForexTransaction)
    private readonly forexTxnRepo: Repository<ForexTransaction>
  ) {
    super();
  }

  async process(job: Job<RetryOrderEvent>): Promise<void> {
    this.logger.log(`About retrying forex order [${job.data.orderId}]`);
    await this.handleRetry(job);
  }

  async handleRetry(job: Job<RetryOrderEvent>) {
    const maxRetries = this.configService.get<number>('MAX_FOREX_RETRIES', 3);
    const { data } = job;
    await this.forexOrderRepo.increment(
      { id: data.orderId },
      'retryAttempts',
      1
    );

    const [forexOrder, forexTxn] = await Promise.all([
      this.forexOrderRepo.findOne({
        where: { id: data.orderId },
      }),
      this.forexTxnRepo.findOne({ where: { id: data.transactionId } }),
    ]);

    if (forexOrder && forexTxn) {
      if (forexOrder.retryAttempts >= maxRetries) {
        await this.transactionService.failOrder(
          {
            forexOrder,
            forexTxn,
            errMessage: data.errMessage,
            errCode: data.errCode,
          },
          true
        );
        return;
      }

      await this.transactionService.processForexPurchase(forexOrder);
    }
  }
}
