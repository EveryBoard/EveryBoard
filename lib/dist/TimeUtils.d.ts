import { Timestamp } from 'firebase/firestore';
export declare function getMilliseconds(time: Timestamp): number;
export declare function getMillisecondsElapsed(first: Timestamp, second: Timestamp): number;
export declare class TimeUtils {
    static sleep(ms: number): Promise<void>;
}
