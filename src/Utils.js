const Utils = {
    secondsToTimeString: (totalSeconds, showMilliseconds) => {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let millis = Math.floor(((totalSeconds * 1000) % 1000) / 10);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (!showMilliseconds) {
            return `${minutes}:${seconds}`;
        }
        return `${minutes}:${seconds}.${millis}`;
    }
};

export default Utils;
