import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Move } from 'src/app/jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class TutorialStep {

    public static informational(title: string, instruction: string, state: GamePartSlice): TutorialStep {
        return new TutorialStep(title,
                                instruction,
                                state,
                                null,
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
    ): TutorialStep
    {
        return new TutorialStep(title,
                                instruction,
                                state,
                                acceptedMoves,
                                acceptedMoves[0],
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
    ): TutorialStep
    {
        return new TutorialStep(title,
                                instruction,
                                state,
                                null,
                                null,
                                acceptedClicks,
                                null,
                                successMessage,
                                failureMessage);
    }
    public static anyMove(title: string,
                          instruction: string,
                          state: GamePartSlice,
                          solutionMove: Move,
                          successMessage: string,
    ): TutorialStep
    {
        return new TutorialStep(title,
                                instruction,
                                state,
                                [],
                                solutionMove,
                                null,
                                null,
                                successMessage,
                                null);
    }
    public static fromPredicate(title: string,
                                instruction: string,
                                state: GamePartSlice,
                                solutionMove: Move,
                                predicate: (move: Move, resultingState: GamePartSlice) => MGPValidation,
                                successMessage: string,
    ): TutorialStep
    {
        return new TutorialStep(title,
                                instruction,
                                state,
                                null,
                                solutionMove,
                                null,
                                predicate,
                                successMessage,
                                null);
    }
    private constructor(public readonly title: string,
                       public readonly instruction: string,
                       public readonly state: GamePartSlice,
                       public readonly acceptedMoves: ReadonlyArray<Move>,
                       public readonly solutionMove: Move,
                       public readonly acceptedClicks: ReadonlyArray<string>,
                       public readonly predicate: (move: Move, resultingState: GamePartSlice) => MGPValidation,
                       public readonly successMessage: string,
                       public readonly failureMessage: string,
                       public readonly previousMove?: Move,
    ) { }
    public isMove(): boolean {
        return this.acceptedMoves != null;
    }
    public isAnyMove(): boolean {
        return this.acceptedMoves != null && this.acceptedMoves.length === 0;
    }
    public isClick(): boolean {
        return this.acceptedClicks != null && this.acceptedClicks.length > 0;
    }
    public isPredicate(): boolean {
        return this.predicate != null;
    }
    public isInformation(): boolean {
        return this.acceptedClicks == null &&
               this.acceptedMoves == null &&
               this.predicate == null;
    }
    public withPreviousMove(previousMove: Move): TutorialStep {
        return new TutorialStep(this.title,
                                this.instruction,
                                this.state,
                                this.acceptedMoves,
                                this.solutionMove,
                                this.acceptedClicks,
                                this.predicate,
                                this.successMessage,
                                this.failureMessage,
                                previousMove);
    }
}
