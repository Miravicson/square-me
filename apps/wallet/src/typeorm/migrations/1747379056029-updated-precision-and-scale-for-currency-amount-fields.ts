import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedPrecisionAndScaleForCurrencyAmountFields1747379056029
  implements MigrationInterface
{
  name = 'UpdatedPrecisionAndScaleForCurrencyAmountFields1747379056029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wallet_transaction"
            ALTER COLUMN "amount" TYPE numeric
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ALTER COLUMN "balance" TYPE numeric
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ALTER COLUMN "balance" TYPE numeric(10, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transaction"
            ALTER COLUMN "amount" TYPE numeric(10, 2)
        `);
  }
}
