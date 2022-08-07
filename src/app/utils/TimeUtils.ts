import { Timestamp } from 'firebase/firestore';

export function getMilliseconds(time: Timestamp): number {
    return time.seconds * 1000 + (time.nanoseconds / (1000 * 1000));
}

export function getMillisecondsDifference(first: Timestamp, second: Timestamp): number {
    return getMilliseconds(second) - getMilliseconds(first);
}
