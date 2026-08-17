import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from '../../jscaip/Coord';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { PlayerOrNone } from '../../jscaip/Player';
import { RulesFailure } from '../../jscaip/RulesFailure';

import { QuixoHeuristic } from './QuixoHeuristic';
import { QuixoMove } from './QuixoMove';
import { QuixoMoveGenerator } from './QuixoMoveGenerator';
import { QuixoRules } from './QuixoRules';
import { QuixoConfig, QuixoState } from './QuixoState';

@Component({
    selector: 'app-quixo',
    templateUrl: './quixo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class QuixoComponent extends RectangularGameComponent<QuixoRules,
                                                             QuixoMove,
                                                             QuixoState,
                                                             PlayerOrNone,
                                                             QuixoConfig>
{

    public QuixoState: typeof QuixoState = QuixoState;

    private lastMoveCoords: Coord[] = [];

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    private chosenDirection: Orthogonal;

    private victoriousCoords: Coord[] = [];

    public constructor() {
        super('Quixo');
        this.aiConfig = {
            minimax: [{
                id: 'Piece Count',
                name: $localize`Piece Count`,
                heuristic: (): QuixoHeuristic => new QuixoHeuristic(),
                moveGenerator: (): QuixoMoveGenerator => new QuixoMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): QuixoMoveGenerator => new QuixoMoveGenerator(),
            }],
        };
        this.encoder = QuixoMove.encoder;
    }

    public override async showLastMove(move: QuixoMove): Promise<void> {
        let coord: Coord = move.coord;
        while (this.state.isOnBoard(coord)) {
            this.lastMoveCoords.push(coord);
            coord = coord.getNext(move.direction);
        }
    }

    public override hideLastMove(): void {
        this.lastMoveCoords = [];
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.state = this.getState();
        this.board = this.state.board;
        this.victoriousCoords = QuixoRules.getVictoriousCoords(this.state);
    }

    public override cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
    }

    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const player: PlayerOrNone = this.board[y][x];
        const classes: string[] = [];

        classes.push(this.getPlayerClass(player));
        if (this.chosenCoord.equalsValue(coord)) {
            classes.push('selected-stroke');
        } else if (this.lastMoveCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke');
        }
        if (this.victoriousCoords.some((c: Coord): boolean => c.equals(coord))) {
            classes.push('victory-stroke');
        }
        return classes;
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        const state: QuixoState = this.getState();
        const coordLegality: MGPValidation = this.rules.isValidCoord(state, clickedCoord);
        if (coordLegality.isFailure()) {
            return this.cancelMove(coordLegality.getReason());
        }
        if (this.board[y][x] === this.state.getCurrentOpponent()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        } else {
            if (this.chosenCoord.equalsValue(clickedCoord)) {
                return this.cancelMove();
            } else {
                this.chosenCoord = MGPOptional.of(clickedCoord);
                return MGPValidation.SUCCESS;
            }
        }
    }

    public getPossiblesDirections(): Orthogonal[] {
        const directions: Orthogonal[] = [];
        const chosenCoord: Coord = this.chosenCoord.get();
        const state: QuixoState = this.getState();
        if (chosenCoord.x < state.getWidth() - 1) directions.push(Orthogonal.RIGHT);
        if (0 < chosenCoord.x) directions.push(Orthogonal.LEFT);
        if (chosenCoord.y < state.getHeight() - 1) directions.push(Orthogonal.DOWN);
        if (0 < chosenCoord.y) directions.push(Orthogonal.UP);
        return directions;
    }

    @ClickHandler((direction: Orthogonal) => `#choose-direction-${ direction.toString() }`)
    public async chooseDirection(direction: Orthogonal): Promise<MGPValidation> {
        this.chosenDirection = direction;
        return await this.tryMove();
    }

    public async tryMove(): Promise<MGPValidation> {
        const chosenCoord: Coord = this.chosenCoord.get();
        const move: QuixoMove = new QuixoMove(chosenCoord.x,
                                              chosenCoord.y,
                                              this.chosenDirection);
        return this.chooseMove(move);
    }

    public getQuixoArrowTransform(orientation: Orthogonal): string {
        const state: QuixoState = this.getState();
        const boardWidth: number = state.getWidth() * this.SPACE_SIZE;
        const boardHeight: number = state.getHeight() * this.SPACE_SIZE;
        return this.getArrowTransform(boardWidth, boardHeight, orientation);
    }

}
