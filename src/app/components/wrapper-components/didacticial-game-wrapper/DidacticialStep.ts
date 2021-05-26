import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Move } from 'src/app/jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class DidacticialStep {

    public static informational(title: string, instruction: string, state: GamePartSlice): DidacticialStep {
        return new DidacticialStep(title,
                                   instruction,
                                   state,
                                   null,
                                   null,
                                   null,
                                   null,
                                   null);
    }
    public static fromMove(title: string,
                           instruction: string,
                           state: GamePartSlice,
                           acceptedMoves: ReadonlyArray<Move>,
                           successMessage: string,
                           failureMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   state,
                                   acceptedMoves,
                                   null,
                                   null,
                                   successMessage,
                                   failureMessage);
    }
    public static forClick(title: string,
                           instruction: string,
                           state: GamePartSlice,
                           acceptedClicks: ReadonlyArray<string>,
                           successMessage: string,
                           failureMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   state,
                                   null,
                                   acceptedClicks,
                                   null,
                                   successMessage,
                                   failureMessage);
    }
    public static anyMove(title: string,
                          instruction: string,
                          state: GamePartSlice,
                          successMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   state,
                                   [],
                                   null,
                                   null,
                                   successMessage,
                                   null);
    }
    public static fromPredicate(title: string,
                                instruction: string,
                                state: GamePartSlice,
                                predicate: (move: Move, resultingState: GamePartSlice) => MGPValidation,
                                successMessage: string,
    ): DidacticialStep
    {
        return new DidacticialStep(title,
                                   instruction,
                                   state,
                                   null,
                                   null,
                                   predicate,
                                   successMessage,
                                   null);
    }
    private constructor(public readonly title: string,
                       public readonly instruction: string,
                       public readonly state: GamePartSlice,
                       public readonly acceptedMoves: ReadonlyArray<Move>,
                       public readonly acceptedClicks: ReadonlyArray<string>,
                       public readonly predicate: (move: Move, resultingState: GamePartSlice) => MGPValidation,
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
    public isPredicate(): boolean {
        return this.predicate != null;
    }
    public isInformation(): boolean {
        return this.acceptedClicks == null &&
               this.acceptedMoves == null &&
               this.predicate == null;
    }
}
