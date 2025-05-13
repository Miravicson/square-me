import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1747172465959 implements MigrationInterface {
  name = 'InitialMigration1747172465959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."forex_transaction_status_enum" AS ENUM('initiated', 'completed', 'failed')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."forex_transaction_errorstatus_enum" AS ENUM(
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
            CREATE TABLE "forex_transaction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "orderId" uuid NOT NULL,
                "baseCurrency" character varying NOT NULL,
                "targetCurrency" character varying NOT NULL,
                "amount" numeric(10, 2) NOT NULL DEFAULT '0',
                "exchangeRate" numeric(10, 2) DEFAULT '0',
                "targetAmount" numeric(10, 2) DEFAULT '0',
                "status" "public"."forex_transaction_status_enum" NOT NULL,
                "errorStatus" "public"."forex_transaction_errorstatus_enum",
                "errorMessage" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5148e4f4275449afb86084b49aa" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."forex_order_type_enum" AS ENUM('buy', 'sell')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."forex_order_status_enum" AS ENUM('pending', 'completed', 'failed')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."forex_order_errorstatus_enum" AS ENUM(
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
            CREATE TABLE "forex_order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "userEmail" character varying NOT NULL,
                "type" "public"."forex_order_type_enum" NOT NULL,
                "baseCurrency" character varying NOT NULL,
                "targetCurrency" character varying NOT NULL,
                "amount" numeric(10, 2) NOT NULL DEFAULT '0',
                "status" "public"."forex_order_status_enum" NOT NULL,
                "retryAttempts" integer NOT NULL DEFAULT '0',
                "errorStatus" "public"."forex_order_errorstatus_enum",
                "errorMessage" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_eb33d40f928a41b8889fa47ceb7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "forex_transaction"
            ADD CONSTRAINT "FK_af80fd612a25346e650a4ce537c" FOREIGN KEY ("orderId") REFERENCES "forex_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "forex_transaction" DROP CONSTRAINT "FK_af80fd612a25346e650a4ce537c"
        `);
    await queryRunner.query(`
            DROP TABLE "forex_order"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."forex_order_errorstatus_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."forex_order_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."forex_order_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "forex_transaction"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."forex_transaction_errorstatus_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."forex_transaction_status_enum"
        `);
  }
}
