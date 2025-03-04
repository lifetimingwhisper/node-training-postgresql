const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Course',
  tableName: 'COURSE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    user_id: {
      type: 'uuid',
      nullable: false,
      foreignKey: {
        name: 'course_user_id_fkey',
        columnNames: ['user_id'],
        referencedTableName: 'USER',
        referencedColumnNames: ['id']
      }
    },
    skill_id: {
      type: 'uuid',
      nullable: false,
      foreignKey: {
        name: 'course_skill_id_fkey',  // Constraint name in column definition
        columnNames: ['skill_id'],
        referencedTableName: 'SKILL',
        referencedColumnNames: ['id']
      }
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: false
    },
    start_at: {
      type: 'timestamp',
      nullable: false
    },
    end_at: {
      type: 'timestamp',
      nullable: false
    },
    max_participants: {
      type: 'integer',
      nullable: false
    },
    meeting_url: {
      type: 'varchar',
      length: 2048,
      nullable: false
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      nullable: false
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
      nullable: false
    }
  },
  relations: {
    Skill: {
      target: 'Skill',
      type: 'many-to-one',
      inverseSide: 'Skill',
      joinColumn: {
        name: 'skill_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'course_skill_id_fkey'
      }
    },
    User: {
      target: 'User',                 // 1. Related entity (User table)
      type: 'many-to-one',            // 2. Relationship type (Many courses belong to one user)
      inverseSide: 'Course',          // 3. The opposite side of the relation (User -> Courses)
      joinColumn: {                   // 4. Configuring the foreign key column
        name: 'user_id',              // 4.1. Column name in the Course table
        referencedColumnName: 'id',   // 4.2. Reference column in the User table (usually reference to the primary key)
        foreignKeyConstraintName: 'course_user_id_fkey' // 4.3. Custom foreign key name (should be the same as what is defined above?) 
      }
    }
  }
})