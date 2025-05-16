import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedPrecisionAndScaleForCurrencyAmountFields1747379072731
  implements MigrationInterface
{
  name = 'UpdatedPrecisionAndScaleForCurrencyAmountFields1747379072731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ALTER COLUMN "amount" TYPE numeric
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ALTER COLUMN "exchangeRate" TYPE numeric
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ALTER COLUMN "targetAmount" TYPE numeric
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_order"
            ALTER COLUMN "amount" TYPE numeric
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "forex_order"
            ALTER COLUMN "amount" TYPE numeric(10, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ALTER COLUMN "targetAmount" TYPE numeric(10, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ALTER COLUMN "exchangeRate" TYPE numeric(10, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ALTER COLUMN "amount" TYPE numeric(10, 2)
        `);
  }
}
