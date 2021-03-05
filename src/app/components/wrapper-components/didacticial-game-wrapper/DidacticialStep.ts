import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Move } from 'src/app/jscaip/Move';

export class DidacticialStep {

    constructor(
        public readonly title: string,
        public readonly instruction: string,
        public readonly slice: GamePartSlice,
        public readonly acceptedMoves: ReadonlyArray<Move>,
        public readonly acceptedClicks: ReadonlyArray<string>,
        public readonly successMessage: string,
        public readonly failureMessage: string,
    ) { }
    public isMove(): boolean {
        return this.acceptedMoves.length > 0;
    }
    public isClick(): boolean {
        return this.acceptedClicks.length > 0;
    }
    public isInformation(): boolean {
        return this.acceptedClicks.length === 0 &&
               this.acceptedMoves.length === 0;
    }
}
