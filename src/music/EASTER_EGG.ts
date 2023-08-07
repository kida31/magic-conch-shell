// Hardcoded fallback values
export const EASTER_EGG = {
    get query() {
        return getRandomItem(["sick enough to die", "never gonna give you up"]);
    }
}

function getRandomItem<T>(arr: T[]): T {
    const maxIdx = arr.length - 1;
    const someIdx = Math.random() * maxIdx;
    const roundedIdx = Math.ceil(someIdx);
    return arr[roundedIdx];
}