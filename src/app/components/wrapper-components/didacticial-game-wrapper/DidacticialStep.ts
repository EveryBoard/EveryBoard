import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Move } from 'src/app/jscaip/Move';

export class DidacticialStep {

    public static informational(title: string, instruction: string, slice: GamePartSlice): DidacticialStep {
        return new DidacticialStep(title,
                                   instruction,
                                   slice,
                                   null,
                                   null,
                                   null,
                                   null);
    }
    public static fromMove(
        title: string,
        instruction: string,
        slice: GamePartSlice,
        acceptedMoves: ReadonlyArray<Move>,
        successMessage: string,
        failureMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   slice,
                                   acceptedMoves,
                                   null,
                                   successMessage,
                                   failureMessage);
    }
    public static forClick(
        title: string,
        instruction: string,
        slice: GamePartSlice,
        acceptedClicks: ReadonlyArray<string>,
        successMessage: string,
        failureMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   slice,
                                   null,
                                   acceptedClicks,
                                   successMessage,
                                   failureMessage);
    }
    public static anyMove(
        title: string,
        instruction: string,
        slice: GamePartSlice,
        successMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   slice,
                                   [],
                                   null,
                                   successMessage,
                                   null);
    }
    private constructor(
        public readonly title: string,
        public readonly instruction: string,
        public readonly slice: GamePartSlice,
        public readonly acceptedMoves: ReadonlyArray<Move>,
        public readonly acceptedClicks: ReadonlyArray<string>,
        public readonly successMessage: string,
        public readonly failureMessage: string,
    ) { }
    public isMove(): boolean {
        return this.acceptedMoves != null;
    }
    public isAnyMove(): boolean {
        return this.acceptedMoves && this.acceptedMoves.length === 0;
    }
    public isClick(): boolean {
        return this.acceptedClicks && this.acceptedClicks.length > 0;
    }
    public isInformation(): boolean {
        return this.acceptedClicks == null &&
               this.acceptedMoves == null;
    }
}
