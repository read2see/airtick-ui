export interface PaginatedResponse<T> {
    data: T[],
    meta: {
        currentPage: number,
        perPage: number,
        total: number,
        totalPages: number,
        nextPage: number | null,
        prevPage: number | null
    }
}