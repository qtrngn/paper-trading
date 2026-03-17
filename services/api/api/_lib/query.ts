export function getSingleQueryParam(raw?: string | string[]): string {

    if (Array.isArray(raw)) {
        return raw[0] ?? "";
    }
    return raw ?? "";
}