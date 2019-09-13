export class Annotation {
    constructor(type, timestamp, totalDuration) {
        this.timestamp = timestamp;
        this.totalDuration = totalDuration;
        this.type = type;
    }
}

export class ActionItemAnnotation extends Annotation {
    constructor(timestamp) {
        super("Action Item", timestamp, 3000);
    }
}
