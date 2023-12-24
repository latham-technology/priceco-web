'use strict'

/**
 * scrip-provider service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::scrip-provider.scrip-provider')
