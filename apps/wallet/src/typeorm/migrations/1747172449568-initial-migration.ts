import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1747172449568 implements MigrationInterface {
  name = 'InitialMigration1747172449568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."wallet_transaction_type_enum" AS ENUM('credit', 'debit', 'withdraw', 'fund')
        `);
    await queryRunner.query(`
            CREATE TABLE "wallet_transaction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."wallet_transaction_type_enum" NOT NULL,
                "amount" numeric(10, 2) NOT NULL DEFAULT '0',
                "currency" character varying NOT NULL,
                "description" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "walletId" uuid,
                CONSTRAINT "PK_62a01b9c3a734b96a08c621b371" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "wallet" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "currency" character varying NOT NULL,
                "balance" numeric(10, 2) NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_c8d0130b44210fe9bb058e30c49" UNIQUE ("userId", "currency"),
                CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transaction"
            ADD CONSTRAINT "FK_07de5136ba8e92bb97d45b9a7af" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_07de5136ba8e92bb97d45b9a7af"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet_transaction"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."wallet_transaction_type_enum"
        `);
  }
}
