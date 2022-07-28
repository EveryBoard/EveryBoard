import { Time } from '../domain/Time';

export function getMilliseconds(time: Time): number {
    return time.seconds * 1000 + (time.nanoseconds / (1000 * 1000));
}

export function getMillisecondsDifference(first: Time, second: Time): number {
    console.log('rema rema rema rema', getMilliseconds(first), getMilliseconds(second))
    return getMilliseconds(second) - getMilliseconds(first);
}
