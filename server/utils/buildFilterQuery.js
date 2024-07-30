export function checkFilterQuery(event) {
    const enabledFilters = {}
    const query = getQuery(event)

    if (query.page) {
        if (isNaN(query.page) || query.page < 0) {
            enabledFilters.page = 0
        } else {
            enabledFilters.page = parseInt(query.page)
        }
    } else {
        enabledFilters.page = 0
    }

    if (query.perPage) {
        if (
            isNaN(query.perPage) ||
            query.perPage < 1 ||
            query.perPage > 100
        ) {
            enabledFilters.perPage = 10
        } else {
            enabledFilters.perPage = parseInt(query.perPage)
        }
    } else {
        enabledFilters.perPage = 10
    }

    if (query.orderKey) {
        enabledFilters.orderKey = query.orderKey
    }

    if (query.orderValue) {
        if (!['asc', 'desc'].includes(query.orderValue)) {
            enabledFilters.orderValue = 'desc'
        } else {
            enabledFilters.orderValue = query.orderValue
        }
    } else if (enabledFilters.orderKey) {
        enabledFilters.orderValue = 'desc'
    }

    if (query.filters) {
        enabledFilters.filters = JSON.parse(query.filters)
    }

    return enabledFilters
}

export function useFilterQuery(event) {
    const enabledFilters = checkFilterQuery(event)
    const usedFilter = {
        where: {
            AND: [],
            OR: [],
        },
    }

    if (enabledFilters.filters) {
        for (const key in enabledFilters.filters) {
            const filterValues = enabledFilters.filters[key]

            if (key.includes('.')) {
                const [relation, column] = key.split('.')

                if (relation === 'user' && column === 'fullName') {
                    // Cannot filter on computed columns in prisma
                    // Need to spread filter to firstName and lastName

                    if (filterValues.length === 1) {
                        if (emptyValue(filterValues[0])) continue

                        usedFilter.where.OR.push({
                            [relation]: {
                                firstName: filterValues[0],
                            },
                        })
                        usedFilter.where.OR.push({
                            [relation]: {
                                lastName: filterValues[0],
                            },
                        })
                    } else {
                        if (emptyValue(filterValues)) continue

                        usedFilter.where.OR.push({
                            [relation]: {
                                firstName: filterValues,
                            },
                        })
                        usedFilter.where.OR.push({
                            [relation]: {
                                lastName: filterValues,
                            },
                        })
                    }

                    continue
                }

                if (filterValues.length === 1) {
                    if (emptyValue(filterValues[0])) continue

                    usedFilter.where.AND.push({
                        [relation]: {
                            [column]: filterValues[0],
                        },
                    })
                } else {
                    if (emptyValue(filterValues)) continue

                    usedFilter.where.AND.push({
                        [relation]: {
                            [column]: {
                                in: filterValues,
                            },
                        },
                    })
                }
            } else if (filterValues.length === 1) {
                if (emptyValue(filterValues[0])) continue

                usedFilter.where.AND.push({
                    [key]: filterValues[0],
                })
            } else {
                if (emptyValue(filterValues)) continue

                usedFilter.where.AND.push({
                    [key]: {
                        in: filterValues,
                    },
                })
            }
        }
    }

    if (enabledFilters.searchKey && enabledFilters.searchValue) {
        if (enabledFilters.searchKey.includes('.')) {
            const [relation, column] =
                enabledFilters.searchKey.split('.')

            usedFilter.where.AND.push({
                [relation]: {
                    [column]: {
                        contains: enabledFilters.searchValue,
                    },
                },
            })
        } else {
            usedFilter.where.AND.push({
                [enabledFilters.searchKey]: {
                    contains: enabledFilters.searchValue,
                },
            })
        }
    }

    if (enabledFilters.orderKey) {
        usedFilter.orderBy = {
            [enabledFilters.orderKey]: enabledFilters.orderValue,
        }
    }

    if (!emptyValue(enabledFilters.page) && enabledFilters.perPage) {
        usedFilter.skip = enabledFilters.perPage * enabledFilters.page
        usedFilter.take = enabledFilters.perPage
    }

    if (usedFilter.where.AND.length === 0) {
        delete usedFilter.where.AND
    }

    if (usedFilter.where.OR.length === 0) {
        delete usedFilter.where.OR
    }

    return usedFilter
}

function emptyValue(value) {
    return ['', null, undefined].includes(value)
}
