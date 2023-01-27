String.prototype.toSeconds = function () {
    const parts = this.split(":").map(s => parseInt(s));
    if (parts.length === 3) {
        return (parts[0] * 3600) +
            (parts[1] * 60) +
            (parts[2]);
    } else {
        return parts[0] * 60 + parts[1];
    }
}


Number.prototype.toHHMMSS = function () {
    const sec_num = this; // don't forget the second param
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

Array.prototype.toFormattedTrackString = function (limit = 10, enumerated = true, offset = 0) {
    let strParts = this
        .slice(0, limit)
        .map((track) => `${track.title} [${track.duration}]`);

    if (enumerated) {
        strParts.map((line, idx) => `${idx + 1 + offset}. ${line}`);
    }

    const fullStr = strParts.join('\n');

    if (this.length > limit) {
        return fullStr + "\n...";
    } else {
        return fullStr;
    }
}

Array.prototype.sum = function () {
    return this.reduce((a, b) => a + b, 0)
}

Array.prototype.asChoices = function () {
    return this.map((str) => ({name: str, value: str}))
}