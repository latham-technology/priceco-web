export function usePagination(event) {
    let { page = 1, per_page: perPage = 10 } = getRouterParams(event)

    page = parseInt(page)
    perPage = parseInt(perPage)
}
