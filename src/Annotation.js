import uuid from "uuid";
export class Annotation {
    constructor(type, timestamp, totalDuration) {
        this.id = uuid.v4();
        this.timestamp = timestamp;
        this.totalDuration = totalDuration;
        this.type = type;
    }

    getStartTimeMs = () => {
        return this.timestamp - this.totalDuration / 2;
    };

    getEndTimeMs = () => {
        return this.timestamp + this.totalDuration / 2;
    };
}

export class ActionItemAnnotation extends Annotation {
    constructor(timestamp) {
        super("Action Item", timestamp, 10000);
    }
}
