const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema ({
    name: 'CreditPurchase',
    tableName: 'CREDIT_PURCHASE',
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
        credit_package_id: {
            type: 'uuid',
            nullable: false,
            relations: {

            }
        },
        purchased_credits: {
            type: 'integer',
            nullable: false
        },
        price_paid: {
            type: 'numeric',
            precision: 10,
            scale: 2,
            nullable: false
        },
        createdAt: {
            createDate: true,
            name: 'created_at',
            nullable: false
        },
        purchaseAt: {
            type: 'timestamp',
            name: 'purchase_at',
            nullable: false
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
              foreignKeyConstraintName: 'credit_purchase_user_id_fkey'
            }
        },
        CreditPackaage: {
            target: 'CreditPackage',
            type: 'many-to-one',
            inverseSide: 'CreditPackage',
            joinColumn: {
                name: 'credit_package_id',
                referencedColumnName: 'id',
                foreignKeyConstraintName: 'credit_purchase_credit_package_id_fkey'
            }
        }
    }
})