import { Move } from 'src/app/jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AbstractGameState } from 'src/app/jscaip/GameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export abstract class TutorialStep {
    public static fromMove(title: string,
                           instruction: string,
                           state: AbstractGameState,
                           acceptedMoves: ReadonlyArray<Move>,
                           successMessage: string,
                           failureMessage: string)
    : TutorialStep {
        return new TutorialStepMove(title, instruction, state, acceptedMoves, successMessage, failureMessage);
    }
    public static forClick(title: string,
                           instruction: string,
                           state: AbstractGameState,
                           acceptedClicks: ReadonlyArray<string>,
                           successMessage: string,
                           failureMessage: string)
    : TutorialStep {
        return new TutorialStepClick(title, instruction, state, acceptedClicks, successMessage, failureMessage);
    }
    public static anyMove(title: string,
                          instruction: string,
                          state: AbstractGameState,
                          solutionMove: Move,
                          successMessage: string)
    : TutorialStep {
        return new TutorialStepAnyMove(title, instruction, state, solutionMove, successMessage);
    }
    public static fromPredicate(title: string,
                                instruction: string,
                                state: AbstractGameState,
                                solutionMove: Move,
                                predicate: (move: Move, resultingState: AbstractGameState) => MGPValidation,
                                successMessage: string)
    : TutorialStep {
        return new TutorialStepPredicate(title, instruction, state, solutionMove, predicate, successMessage);
    }
    public static informational(title: string,
                                instruction: string,
                                state: AbstractGameState)
    : TutorialStep {
        return new TutorialStepInformational(title, instruction, state);
    }

    public previousMove: MGPOptional<Move> = MGPOptional.empty()
    protected constructor(public title: string,
                          public instruction: string,
                          public state: AbstractGameState) {
    }
    public isMove(): this is TutorialStepMove {
        return false;
    }
    public isAnyMove(): this is TutorialStepAnyMove {
        return false;
    }
    public isClick(): this is TutorialStepClick {
        return false;
    }
    public isPredicate(): this is TutorialStepPredicate {
        return false;
    }
    public isInformation(): this is TutorialStepInformational {
        return false;
    }
    public hasSolution(): this is TutorialStepWithSolution {
        return false;
    }
    public withPreviousMove(previousMove: Move): this {
        this.previousMove = MGPOptional.of(previousMove);
        return this;
    }
    public abstract getSuccessMessage(): string;
    public abstract getFailureMessage(): string;

}

abstract class TutorialStepWithSolution extends TutorialStep {
    public constructor(title: string,
                       instruction: string,
                       state: AbstractGameState,
                       private readonly solution: Move,
                       private readonly successMessage: string,
                       private readonly failureMessage?: string) {
        super(title, instruction, state);
    }
    public hasSolution(): this is TutorialStepWithSolution {
        return true;
    }
    public getSolution(): Move {
        return this.solution;
    }
    public getSuccessMessage(): string {
        return this.successMessage;
    }
    public getFailureMessage(): string {
        if (this.failureMessage !== undefined) {
            return this.failureMessage;
        } else {
            throw new Error('This step has no failure message');
        }
    }

}

export class TutorialStepMove extends TutorialStepWithSolution {
    public constructor(title: string,
                       instruction: string,
                       state: AbstractGameState,
                       public readonly acceptedMoves: ReadonlyArray<Move>,
                       successMessage: string,
                       failureMessage: string) {
        super(title, instruction, state, acceptedMoves[0], successMessage, failureMessage);
        if (acceptedMoves.length === 0) {
            throw new Error('TutorialStepMove: At least one accepted move should be provided, otherwise use TutorialStepInformational');
        }

    }
    public isMove(): this is TutorialStepMove {
        return true;
    }
}

export class TutorialStepAnyMove extends TutorialStepWithSolution {
    public constructor(title: string,
                       instruction: string,
                       state: AbstractGameState,
                       solutionMove: Move,
                       successMessage: string) {
        super(title, instruction, state, solutionMove, successMessage);
    }
    public isAnyMove(): this is TutorialStepAnyMove {
        return true;
    }
}

export class TutorialStepClick extends TutorialStep {
    public constructor(title: string,
                       instruction: string,
                       state: AbstractGameState,
                       public readonly acceptedClicks: ReadonlyArray<string>,
                       public readonly successMessage: string,
                       public readonly failureMessage: string) {
        super(title, instruction, state);
    }
    public isClick(): this is TutorialStepClick {
        return true;
    }
    public getSuccessMessage(): string {
        return this.successMessage;
    }
    public getFailureMessage(): string {
        return this.failureMessage;
    }
}

export class TutorialStepPredicate extends TutorialStepWithSolution {
    public constructor(title: string,
                       instruction: string,
                       state: AbstractGameState,
                       solutionMove: Move,
                       public readonly predicate: (move: Move, resultingState: AbstractGameState) => MGPValidation,
                       successMessage: string) {
        super(title, instruction, state, solutionMove, successMessage);
    }
    public isPredicate(): this is TutorialStepPredicate {
        return true;
    }
}

export class TutorialStepInformational extends TutorialStep {
    public isInformation(): this is TutorialStepInformational {
        return true;
    }
    public getSuccessMessage(): string {
        throw new Error('TutorialStepInformational has no success message');
    }
    public getFailureMessage(): string {
        throw new Error('TutorialStepInformational has no failure message');
    }
}
