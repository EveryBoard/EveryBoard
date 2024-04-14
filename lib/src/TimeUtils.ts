import { Timestamp } from 'firebase/firestore';

export function getMilliseconds(time: Timestamp): number {
    return time.seconds * 1000 + (time.nanoseconds / (1000 * 1000));
}

export function getMillisecondsElapsed(first: Timestamp, second: Timestamp): number {
    return getMilliseconds(second) - getMilliseconds(first);
}

export class TimeUtils {

    public static async sleep(ms: number): Promise<void> {
        return new Promise((resolve: (result: void) => void) => {
            window.setTimeout(resolve, ms);
        });
    }
}
