import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { Ordinal } from '../../jscaip/Ordinal';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { RulesFailure } from '../../jscaip/RulesFailure';

import { SquarzMinimax } from './SquarzMinimax';
import { SquarzMove as SquarzMove } from './SquarzMove';
import { SquarzMoveGenerator } from './SquarzMoveGenerator';
import { SquarzConfig, SquarzRules } from './SquarzRules';
import { SquarzState } from './SquarzState';

@Component({
    selector: 'app-squarz',
    templateUrl: './squarz.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class SquarzComponent extends RectangularGameComponent<SquarzRules,
                                                                 SquarzMove,
                                                                 SquarzState,
                                                                 PlayerOrNone,
                                                                 SquarzConfig>
{
    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;

    private movedSpaces: Coord[] = [];
    private movedPieces: Coord[] = [];
    private captured: Coord[] = [];

    public moves: SquarzMove[] = [];

    public selected: MGPOptional<Coord> = MGPOptional.empty();

    public constructor() {
        super();
        this.setRulesAndNode('Squarz');
        this.availableAIs = [
            new SquarzMinimax(),
            new MCTS($localize`MCTS`, new SquarzMoveGenerator(this.rules), this.rules),
        ];
        this.encoder = SquarzMove.encoder;

        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: SquarzState = this.getState();
        this.board = state.getCopiedBoard();
        this.scores = MGPOptional.of(this.getState().getScores());
    }

    public override async showLastMove(move: SquarzMove): Promise<void> {
        const previousState: SquarzState = this.getPreviousState();
        const previousOpponent: Player = previousState.getCurrentOpponent();
        if (move.isJump()) {
            this.movedSpaces.push(move.getStart());
        } else {
            this.movedPieces.push(move.getStart());
        }
        const moveEnd: Coord = move.getEnd();
        this.movedPieces.push(moveEnd);
        this.movedSpaces.push(moveEnd);
        for (const direction of Ordinal.ORDINALS) {
            const neighbor: Coord = moveEnd.getNext(direction);
            if (previousState.hasPieceAt(neighbor, previousOpponent)) {
                this.captured.push(neighbor);
            }
        }
    }

    public override hideLastMove(): void {
        this.movedSpaces = [];
        this.movedPieces = [];
        this.captured = [];
    }

    public override cancelMoveAttempt(): void {
        this.selected = MGPOptional.empty();
        this.moves = [];
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clicked: Coord = new Coord(x, y);
        if (this.selected.equalsValue(clicked)) {
            await this.cancelMove();
            return MGPValidation.SUCCESS;
        }
        if (this.selected.isAbsent() ||
            this.pieceBelongsToCurrentPlayer(clicked))
        {
            return this.choosePiece(clicked);
        } else {
            return this.chooseDestination(x, y);
        }
    }

    private pieceBelongsToCurrentPlayer(coord: Coord): boolean {
        const state: SquarzState = this.getState();
        const player: Player = state.getCurrentPlayer();
        return state.getPieceAt(coord) === player;
    }

    private async choosePiece(coord: Coord): Promise<MGPValidation> {
        if (this.getState().getPieceAt(coord).isNone()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (this.pieceBelongsToCurrentPlayer(coord) === false) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }

        this.selected = MGPOptional.of(coord);
        this.showIndicators();
        return MGPValidation.SUCCESS;
    }
    private showIndicators(): void {
        this.moves = this.rules.getPossiblesMoves(this.getState(), this.selected.get(), this.getConfig());
    }

    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.selected.get();
        const chosenDestination: Coord = new Coord(x, y);
        // A check has been done earlier than this is no static-move, hence, the move is valid
        const move: SquarzMove = SquarzMove.from(chosenPiece, chosenDestination).get();
        return await this.chooseMove(move);
    }

    public getRectClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.movedSpaces.some((c: Coord) => c.equals(coord))) {
            return ['moved-fill'];
        } else if (this.captured.some((c: Coord) => c.equals(coord))) {
            return ['captured-fill'];
        } else {
            return [];
        }
    }

    public getPieceClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const coord: Coord = new Coord(x, y);

        const owner: PlayerOrNone = this.getState().getPieceAt(coord);
        classes.push(this.getPlayerClass(owner));

        if (this.selected.equalsValue(coord)) {
            classes.push('selected-stroke');
        } else if (this.movedPieces.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke');
        }
        return classes;
    }

}
