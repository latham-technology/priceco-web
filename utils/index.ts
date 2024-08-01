export function ensureError(value: unknown): Error {
    if (value instanceof Error) return value

    let stringified = '[Unable to stringify the thrown value]'

    try {
        stringified = JSON.stringify(value)
    } catch {}

    const error = new Error(
        `This value was thrown as is, not through an Error: ${stringified}`,
    )

    return error
}

function generateUID() {
    return Math.random().toString(32).substring(2)
}

export function formatID(...params) {
    return ['priceco', useId(), ...params]
        .map((id) => String(id).trim())
        .join('-')
        .replace(/[^a-zA-Z0-9\-_:.]/g, '')
        .trim()
}

export * from './healthcheck'
