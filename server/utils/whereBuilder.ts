type AvailableFiltersInput = {
    filter: unknown
}

type AvailableFiltersOutput<T> = {
    where: T
}

type AvailableFilters<T> = {
    [key: string]: (
        params: AvailableFiltersInput,
    ) => Promise<AvailableFiltersOutput<T>>
}

type DefaultFilters<T> = {
    [key in keyof T]: () => Promise<AvailableFiltersOutput<T>>
}

type ApplyFiltersInput<T> = {
    defaultFilters?: DefaultFilters<T>
    availableFilters: AvailableFilters<T>
    appliedFiltersInput: T
}

type ApplyFiltersOutput<T> = {
    whereBuilder: T
}

export const applyFilters = async <T>(
    params: ApplyFiltersInput<T>,
): Promise<ApplyFiltersOutput<T>> => {
    const { defaultFilters, availableFilters, appliedFiltersInput } =
        params
    const whereBuilder: T = {} as T

    const _defaultFilters = 

    if (defaultFilters) {
        for (const [key] of Object.entries(defaultFilters)) {
            const { where } = await defaultFilters[key]()

            Object.assign(whereBuilder, where)
        }
    }

    for (const [key, value] of Object.entries(appliedFiltersInput)) {
        if (availableFilters[key] && value) {
            const { where } = await availableFilters[key]({
                filter: value,
            })
            Object.assign(whereBuilder, where)
        }
    }

    return {
        whereBuilder,
    }
}
