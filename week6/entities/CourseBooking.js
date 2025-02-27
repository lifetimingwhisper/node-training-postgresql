const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CourseBooking',
    tableName: 'COURSE_BOOKING',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
            nullable: false
        },
        user_id: {
            type: 'uuid',
            nullable: false
        },
        course_id: {
            type: 'uuid',
            nullable: false
        },
        bookingAt: {
            type: 'timestamp',
            name: 'booking_at',
            default: () => 'CURRENT_TIMESTAMP',
            nullable: false
        },
        // status: {
        //     type: 'varchar',
        //     length: 20,
        //     nullable: false
        // },
        joinAt: {
            type: 'timestamp',
            name: 'join_at',
            nullable: true
        },
        leaveAt: {
            type: 'timestamp',
            name: 'leave_at',
            nullable: true
        },
        cancelledAt: {
            type: 'timestamp',
            name: 'cancelled_at',
            nullable: true
        },
        cancellation_reason: {
            type: 'varchar',
            length: 255,
            nullable: true
        },
        createdAt: {
            type: 'timestamp',
            name: 'created_at',
            default: () => 'CURRENT_TIMESTAMP'
        }
    },
    relations: {
        User: {
            target: 'User',
            type: 'many-to-one',
            inverseSide: 'User',
            joinColumn: {
                name: 'user_id',
                referencedColumnName: 'id',
                foreignKeyConstraintName: 'course_booking_user_id_fkey'
            }
        },
        Course: {
            target: 'Course',
            type: 'many-to-one',
            inverseSide: 'Course',
            joinColumn: {
                name: 'course_id',
                referencedColumnName: 'id',
                foreignKeyConstraintName: 'course_booking_course_id_fkey'
            }
        }
    }
})
