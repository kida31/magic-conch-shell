let counter = 0;

module.exports = {
    increment: () => {
        counter += 1
    },
    get: () => {
        return counter
    }
}