import { status } from '@grpc/grpc-js';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export const QUEUE_FOREX_RETRY = 'forex_retry_queue';

export interface RetryOrderEvent {
  orderId: string;
  transactionId: string;
  errMessage: string;
  errCode: status;
}

@Injectable()
export class RetryOrderProducer {
  private readonly logger = new Logger(this.constructor.name);
  constructor(@InjectQueue(QUEUE_FOREX_RETRY) private queue: Queue) {}

  async enqueue(order: RetryOrderEvent) {
    this.logger.log(`About enqueing forex order for retry`);
    await this.queue.add('retry-order', order);
  }
}
