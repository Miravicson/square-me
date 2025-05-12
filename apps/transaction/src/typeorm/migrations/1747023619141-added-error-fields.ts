import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedErrorFields1747023619141 implements MigrationInterface {
  name = 'AddedErrorFields1747023619141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."transaction-service-forex_order_errorstatus_enum" AS ENUM(
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_order"
            ADD "errorStatus" "public"."transaction-service-forex_order_errorstatus_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_order"
            ADD "errorMessage" character varying
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."transaction-service-forex_transaction_errorstatus_enum" AS ENUM(
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD "errorStatus" "public"."transaction-service-forex_transaction_errorstatus_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD "errorMessage" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP COLUMN "errorMessage"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP COLUMN "errorStatus"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."transaction-service-forex_transaction_errorstatus_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_order" DROP COLUMN "errorMessage"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_order" DROP COLUMN "errorStatus"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."transaction-service-forex_order_errorstatus_enum"
        `);
  }
}
