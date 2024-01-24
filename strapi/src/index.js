'use strict'

module.exports = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register(/*{ strapi }*/) {},

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    bootstrap({ strapi }) {
        if (process.env.NODE_ENV === 'development') {
            const params = {
                username: process.env.ADMIN_USER || 'admin',
                password: process.env.ADMIN_PASS || 'admin',
                firstName: process.env.ADMIN_USER || 'Admin',
                lastName: process.env.ADMIN_USER || 'Admin',
                email: process.env.ADMIN_EMAIL || 'admin@test.test',
                blocked: false,
                isActive: true,
            }

            //Check if any account exists.
            try {
                // console.log(strapi)
                const admins = strapi.db
                    .query('admin::user', 'admin')
                    .findMany()
                    .then(console.log)

                if (admins.length === 0) {
                    let tempPass = params.password
                    let verifyRole = strapi.query('role', 'admin').findOne({
                        code: 'strapi-super-admin',
                    })
                    if (!verifyRole) {
                        verifyRole = strapi.query('role', 'admin').create({
                            name: 'Super Admin',
                            code: 'strapi-super-admin',
                            description:
                                'Super Admins can access and manage all features and settings.',
                        })
                    }
                    params.roles = [verifyRole.id]
                    params.password = strapi.admin.services.auth.hashPassword(
                        params.password,
                    )
                    strapi.query('admin::user', 'admin').create({
                        ...params,
                    })
                    strapi.log.info('Admin account was successfully created.')
                    strapi.log.info(`Email: ${params.email}`)
                    strapi.log.info(`Password: ${tempPass}`)
                }
            } catch (error) {
                strapi.log.error(
                    `Couldn't create Admin account during bootstrap: `,
                    error,
                )
            }
        }
    },
}
