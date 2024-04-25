module.exports = {
    apps: [
        {
            name: 'strapi',
            script: 'npm run dev',
            cwd: 'strapi/',
        },
        {
            name: 'web',
            script: 'npm run dev',
            cwd: 'app/',
        },
    ],
}
