
export type APIResponse <T=unknown> = {
    success: boolean,
    data?: T | object | string,
    error?: object | string
}