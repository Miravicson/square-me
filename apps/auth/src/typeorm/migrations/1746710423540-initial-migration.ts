import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1746710423540 implements MigrationInterface {
  name = 'InitialMigration1746710423540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "auth-serviceusers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_c68e50963ed339c3281dc133090" UNIQUE ("email"),
                CONSTRAINT "PK_7fc402d739be8ad01a9a55071a4" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "auth-serviceusers"
        `);
  }
}
