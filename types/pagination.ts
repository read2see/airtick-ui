export interface PaginatedResponse<T> {
    data: T[],
    meta: {
        current_page: number,
        per_page: number,
        total: number,
        total_pages: number,
        next_page: string|null,
        prev_page: string|null
    }
}