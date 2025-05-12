import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamedFieldsAndIntroduceErrorFields1747030960384
  implements MigrationInterface
{
  name = 'RenamedFieldsAndIntroduceErrorFields1747030960384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP COLUMN "rate"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP COLUMN "resultAmount"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_order"
            ADD "retryAttempts" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD "exchangeRate" numeric(10, 2) DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD "targetAmount" numeric(10, 2) DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP COLUMN "targetAmount"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP COLUMN "exchangeRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_order" DROP COLUMN "retryAttempts"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD "resultAmount" numeric(10, 2) DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD "rate" numeric(10, 2) DEFAULT '0'
        `);
  }
}
