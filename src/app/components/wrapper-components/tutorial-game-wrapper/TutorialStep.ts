import { Move } from 'src/app/jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AbstractGameState } from 'src/app/jscaip/GameState';

export class TutorialStep {

    public static informational(title: string, instruction: string, state: AbstractGameState): TutorialStep {
        return new TutorialStep(title,
                                instruction,
                                state,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null);
    }
    public static fromMove(title: string,
                           instruction: string,
                           state: AbstractGameState,
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
                                failureMessage,
                                null);
    }
    public static forClick(title: string,
                           instruction: string,
                           state: AbstractGameState,
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
                                failureMessage,
                                null);
    }
    public static anyMove(title: string,
                          instruction: string,
                          state: AbstractGameState,
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
                                null,
                                null);
    }
    public static fromPredicate(title: string,
                                instruction: string,
                                state: AbstractGameState,
                                solutionMove: Move,
                                predicate: (move: Move, resultingState: AbstractGameState) => MGPValidation,
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
                                null,
                                null);
    }
    private constructor(public readonly title: string,
                        public readonly instruction: string,
                        public readonly state: AbstractGameState,
                        public readonly acceptedMoves: ReadonlyArray<Move> | null,
                        public readonly solutionMove: Move | null,
                        public readonly acceptedClicks: ReadonlyArray<string> | null,
                        public readonly predicate:
                          ((move: Move, resultingState: AbstractGameState) => MGPValidation) | null,
                        public readonly successMessage: string | null,
                        public readonly failureMessage: string | null,
                        public readonly previousMove: Move | null,
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
