export default class AudioItem {
    constructor(annotations, audioUrl, audioStream) {
        this.annotations = annotations;
        this.url = audioUrl;
        this.stream = audioStream;
    }

    hasMedia = () => {
        return (this.stream || this.url) != null;
    };

    getAnnotationForTimestamp = timeStampMs => {
        let resultAnnotation;

        if (this.annotations) {
            this.annotations.forEach(annotation => {
                if (
                    timeStampMs <
                        annotation.timestamp + annotation.totalDuration / 2 &&
                    timeStampMs >
                        annotation.timestamp - annotation.totalDuration / 2
                ) {
                    resultAnnotation = annotation;
                }
            });
        }

        return resultAnnotation;
    };
}
