import { MigrationInterface, QueryRunner } from "typeorm";

export class Week61740553595316 implements MigrationInterface {
    name = 'Week61740553595316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COURSE" ADD CONSTRAINT "course_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "SKILL"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COURSE" DROP CONSTRAINT "course_skill_id_fkey"`);
    }

}

/*
    JC's note : database migration with typeORM commands (雖然設定了 'synchronize' 為 'true'，但自動 migration 一直有問題，所以嘗試手動 migration，仍有問題。最後發現是 databse 有現有的課程資訊和專長並不一致，導致 foreign key 一直出錯，放置在此作為紀錄)
    1. 產生 migration file 在目前的資料夾 : npx typeorm -d ./db/data-source.js migration:generate . (get message 'Migration /Users/jochun/Desktop/Hex/courses/exercises/homework/projects/node-training-postgresql/1740553595316-week6.ts has been generated successfully.')
    2. 執行 migration : npx typeorm -d ./db/data-source.js migration:run (get message 
    'configValue :  false
    query: SELECT * FROM current_schema()
    query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    query: SELECT version();
    query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public' AND "table_name" = 'migrations'
    query: CREATE TABLE "migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id"))
    query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
    No migrations are pending')

*/