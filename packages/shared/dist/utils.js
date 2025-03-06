export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
export function isServer() {
    return typeof window === 'undefined';
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function createQueryString(params) {
    return Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}
//# sourceMappingURL=utils.js.map