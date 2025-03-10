const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name:  'CoachLinkSkill',
    tableName: 'COACH_LINK_SKILL',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid'
        },
        coach_id: {
            type: 'uuid',
            nullable: false
        },
        skill_id: {
            type: 'uuid',
            nullable: false
        },
        createdAt: {
            type: 'timestamp',
            name: 'created_at',
            createDate: true
        }
    },
    // relations: {
    //     Coach: {
    //         target: 'Coach',
    //         type: 'many-to-many',
    //         inverseSide: 'Coach',
    //         joinColumn: {
    //             name: 'coach_id',
    //             referencedColumnName: 'id',
    //             foreignKeyConstraintName: 'coach_link_skill_coach_id_fk'
    //         }
    //     },
    //     Skill: {
    //         target: 'Skill',
    //         type: 'many-to-many',
    //     }
    // }

    relations: {
        Coach: {
          target: 'Coach',
          type: 'many-to-one',
          inverseSide: 'CoachLinkSkill',
          joinColumn: {
            name: 'coach_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'coach_link_skill_coach_id_fk'
          },
          cascade: false
        },
        Skill: {
          target: 'Skill',
          type: 'many-to-one',
          joinColumn: {
            name: 'skill_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'coach_link_skill_skill_id_fk'
          },
          cascade: false
        }
      }
})