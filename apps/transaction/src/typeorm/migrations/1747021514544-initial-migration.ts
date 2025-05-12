import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1747021514544 implements MigrationInterface {
  name = 'InitialMigration1747021514544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."transaction-service-forex_order_type_enum" AS ENUM('buy', 'sell')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."transaction-service-forex_order_status_enum" AS ENUM('pending', 'completed', 'failed')
        `);
    await queryRunner.query(`
            CREATE TABLE "transaction-service-forex_order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "type" "public"."transaction-service-forex_order_type_enum" NOT NULL,
                "baseCurrency" character varying NOT NULL,
                "targetCurrency" character varying NOT NULL,
                "amount" numeric(10, 2) NOT NULL DEFAULT '0',
                "status" "public"."transaction-service-forex_order_status_enum" NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_626a2402dabd8e0dff1ed7d4a34" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."transaction-service-forex_transaction_status_enum" AS ENUM('initiated', 'completed', 'failed')
        `);
    await queryRunner.query(`
            CREATE TABLE "transaction-service-forex_transaction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "orderId" uuid NOT NULL,
                "baseCurrency" character varying NOT NULL,
                "targetCurrency" character varying NOT NULL,
                "amount" numeric(10, 2) NOT NULL DEFAULT '0',
                "rate" numeric(10, 2) DEFAULT '0',
                "resultAmount" numeric(10, 2) DEFAULT '0',
                "status" "public"."transaction-service-forex_transaction_status_enum" NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_0aeae4af043f83fd0b90b38ce24" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction"
            ADD CONSTRAINT "FK_f6a03e38ab456c0716c3b2730ec" FOREIGN KEY ("orderId") REFERENCES "transaction-service-forex_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transaction-service-forex_transaction" DROP CONSTRAINT "FK_f6a03e38ab456c0716c3b2730ec"
        `);
    await queryRunner.query(`
            DROP TABLE "transaction-service-forex_transaction"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."transaction-service-forex_transaction_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "transaction-service-forex_order"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."transaction-service-forex_order_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."transaction-service-forex_order_type_enum"
        `);
  }
}
