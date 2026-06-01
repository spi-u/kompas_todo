import { MigrationInterface, QueryRunner } from "typeorm";

export class ArchiveTasks1780309036624 implements MigrationInterface {
    name = 'ArchiveTasks1780309036624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "archivedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "archivedAt"`);
    }

}
