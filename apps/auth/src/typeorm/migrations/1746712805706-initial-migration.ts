import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1746712805706 implements MigrationInterface {
  name = 'InitialMigration1746712805706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "auth-service-users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_c4256c7c4d69292bd65c4a0aa11" UNIQUE ("email"),
                CONSTRAINT "PK_3232a7dc1f48ba37f800f3d7373" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "auth-service-users"
        `);
  }
}
