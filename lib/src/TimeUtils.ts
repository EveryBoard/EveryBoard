import { Timestamp } from 'firebase/firestore';
import { MGPOptional } from './MGPOptional';
import { Utils } from './Utils';

export function getMilliseconds(time: Timestamp): number {
    return time.seconds * 1000 + (time.nanoseconds / (1000 * 1000));
}

export function getMillisecondsElapsed(first: Timestamp, second: Timestamp): number {
    return getMilliseconds(second) - getMilliseconds(first);
}

export class AnimationCancelled extends Error {
}

export class AnimationTimer {
    public constructor(private readonly timerId: number,
                       private readonly rejectPromise: (error: Error) => void) {
    }
    public cancel(): void {
        try {
        console.log('canceling')
        this.rejectPromise(new AnimationCancelled());
        console.log('clearing timeout')
        window.clearTimeout(this.timerId);
        } catch (e) {
            console.log('error: ' + e)
        }
    }
}

export class TimeUtils {

    private static animationTimer: MGPOptional<AnimationTimer> = MGPOptional.empty();

    public static async sleepForAnimation(ms: number): Promise<void> {
        console.log('sleeping for: ' + ms);
        return new Promise((resolve: (result: void) => void, reject: (reason: Error) => void): void => {
            Utils.assert(this.animationTimer.isAbsent(), 'An animation has been started before the end of another animation. Is it really what you want?');
            this.animationTimer = MGPOptional.of(new AnimationTimer(window.setTimeout(() => {
                console.log('resolving')
                if (this.animationTimer.isAbsent()) {
                    // The animation has been cancelled already, do nothing!
                    console.log('cancelled already')
                } else {
                    // The timer has finished, let's forget about it and resolve the promise
                    this.animationTimer = MGPOptional.empty();
                    console.log('resolving for real')
                    resolve();
                }
            }, ms), reject));
        });
    }

    public static cancelAnimations(): void {
        if (this.animationTimer.isPresent()) {
            this.animationTimer.get().cancel();
            console.log('after having cancelled')
            // Need also to fail the promise!!
            this.animationTimer = MGPOptional.empty();
        }
    }
}
