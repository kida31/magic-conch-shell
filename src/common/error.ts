
export class NotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class InvalidArgumentException extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, InvalidArgumentException.prototype);
    }
}