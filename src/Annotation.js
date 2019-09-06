class Annotation {
    constructor(timestamp, totalDuration) {
        this.timestamp = timestamp;
        this.totalDuration = totalDuration;
    }
}

class ActionItemAnnotation extends Annotation {
    constructor(timestamp) {
        super(timestamp, 30);
    }
}
