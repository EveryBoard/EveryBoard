import { ScoreName } from '../../jscaip/ScoreName';

export class GoPhase {
    public static PLAYING: GoPhase = new GoPhase();
    public static PASSED: GoPhase = new GoPhase();
    public static COUNTING: GoPhase = new GoPhase();
    public static ACCEPT: GoPhase = new GoPhase();
    public static FINISHED: GoPhase = new GoPhase();

    private constructor() {
    }

    public toString(): string {
        switch (this) {
            case GoPhase.PLAYING: return 'PLAYING';
            case GoPhase.PASSED: return 'PASSED';
            case GoPhase.COUNTING: return 'COUNTING';
            case GoPhase.ACCEPT: return 'ACCEPT';
            case GoPhase.FINISHED: return 'FINISHED';
        }
        return '';
    }

    public isPlaying(): boolean {
        return this === GoPhase.PLAYING;
    }

    public isPassed(): boolean {
        return this === GoPhase.PASSED;
    }

    public isCounting(): boolean {
        return this === GoPhase.COUNTING;
    }

    public isAccept(): boolean {
        return this === GoPhase.ACCEPT;
    }

    public isFinished(): boolean {
        return this === GoPhase.FINISHED;
    }

    public allowsPass(): boolean {
        return this.isFinished() === false;
    }

    public getScoreName(): ScoreName {

        if (this.isPlaying() || this.isPassed()) {
            return ScoreName.CAPTURES;
        } else {
            return ScoreName.POINTS;
        }
    }
}
