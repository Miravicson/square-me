import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1746743966949 implements MigrationInterface {
  name = 'InitialMigration1746743966949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "wallet-service-wallet" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "currency" character varying NOT NULL,
                "balance" numeric(10, 2) NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_2c3df96d1f2bdd2a4b70f3b0e29" UNIQUE ("userId", "currency"),
                CONSTRAINT "PK_acfa5ceaf60dd282addda886064" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."wallet-service-wallet_transaction_type_enum" AS ENUM('credit', 'debit')
        `);
    await queryRunner.query(`
            CREATE TABLE "wallet-service-wallet_transaction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."wallet-service-wallet_transaction_type_enum" NOT NULL,
                "amount" double precision NOT NULL,
                "currency" character varying NOT NULL,
                "description" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "walletId" uuid,
                CONSTRAINT "PK_1aa0546ffbb35deb7e8cddbb3de" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet-service-wallet_transaction"
            ADD CONSTRAINT "FK_479dc658ddfba88d54576662f71" FOREIGN KEY ("walletId") REFERENCES "wallet-service-wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wallet-service-wallet_transaction" DROP CONSTRAINT "FK_479dc658ddfba88d54576662f71"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet-service-wallet_transaction"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."wallet-service-wallet_transaction_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet-service-wallet"
        `);
  }
}
