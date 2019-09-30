import uuid from "uuid";
export class Annotation {
    constructor(type, timestamp, totalDuration) {
        this.id = uuid.v4();
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
