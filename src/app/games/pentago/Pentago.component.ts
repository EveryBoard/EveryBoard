import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbstractGameComponent }
    from 'src/app/components/game-components/abstract-game-component/AbstractGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/jscaip/Encoder';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PentagoLegalityStatus } from './PentagoLegalityStatus';
import { PentagoMove } from './PentagoMove';
import { PentagoRules } from './PentagoRules';
import { PentagoState } from './PentagoState';

@Component({
    selector: 'app-pentago',
    templateUrl: './Pentago.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class PentagoComponent extends AbstractGameComponent<PentagoMove,
                                                            PentagoState,
                                                            PentagoLegalityStatus>
{

    public rules: PentagoRules = new PentagoRules(PentagoState);

    public encoder: Encoder<PentagoMove>;

    public readonly BLOCK_WIDTH: number;
    public readonly BLOCK_SEPARATION: number;

    public arrows: [string, number, boolean][] = [];

    public currentDrop: Coord;

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.updateBoard();
        this.availableMinimaxes = [];
        this.BLOCK_WIDTH = (3 * this.CASE_SIZE) + (2 * this.STROKE_WIDTH);
        this.BLOCK_SEPARATION = (this.BLOCK_WIDTH + 2 * this.STROKE_WIDTH);
    }
    public updateBoard(): void {
        this.board = this.rules.node.gamePartSlice.getCopiedBoard();
    }
    public cancelMoveAttempt(): void {
        this.arrows = [];
        this.currentDrop = null;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const drop: PentagoMove = PentagoMove.rotationless(x, y);
        const state: PentagoState = this.rules.node.gamePartSlice;
        const postDropState: PentagoState = state.applyLegalDrop(drop);
        if (postDropState.neutralBlocks.length === 4) {
            return this.chooseMove(drop, state, null, null);
        }
        this.currentDrop = new Coord(x, y);
        this.displayArrows(postDropState.neutralBlocks);
    }
    public displayArrows(neutralBlocks: number[]): void {
        this.arrows = [];
        for (let blockIndex: number = 0; blockIndex < 4; blockIndex++) {
            if (neutralBlocks.includes(blockIndex) === false) {
                const bx: number = blockIndex % 2;
                const by: number = blockIndex < 2 ? 0 : 1;
                const localOffset: number = (2 * this.STROKE_WIDTH) + (0.5 * this.CASE_SIZE);
                const anticlockwiseX: number = bx * this.BLOCK_SEPARATION + localOffset;
                const anticlockwiseY: number = by * this.BLOCK_SEPARATION + localOffset;
                let arrowPath: string =
                    'M ' +
                    (anticlockwiseX + (0.75 * this.CASE_SIZE)) + ' ' +
                    (anticlockwiseY - (0.25 * this.CASE_SIZE)) +
                    ' q ' +
                    (- this.CASE_SIZE) + ' ' +
                    '0 ' +
                    (- this.CASE_SIZE) + ' ' +
                    this.CASE_SIZE;
                this.arrows.push([arrowPath, blockIndex, false]);
                arrowPath =
                    'M ' +
                    (anticlockwiseX + (1.25 * this.CASE_SIZE)) + ' ' +
                    (anticlockwiseY - (0.25 * this.CASE_SIZE)) +
                    ' q ' +
                    this.CASE_SIZE + ' ' +
                    '0 ' +
                    this.CASE_SIZE + ' ' +
                    this.CASE_SIZE;
                this.arrows.push([arrowPath, blockIndex, true]);
            }
        }
    }
    public getBlockClasses(blockIndex: number): string[] {
        return;
    }
    public getCaseClasses(x: number, y: number): string[] {
        const player: string = this.getPlayerClass(Player.of(this.board[y][x]));
        return [player];
    }
    public async rotate(arrow: [string, number, boolean]): Promise<MGPValidation> {
        const clockwise: string = arrow[2] ? 'clockwise' : 'anticlockwise';
        const clickValidity: MGPValidation = this.canUserPlay('#rotate_' + arrow[1] + '_' + clockwise);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const move: PentagoMove = PentagoMove.withRotation(this.currentDrop.x, this.currentDrop.y, arrow[1], arrow[2]);
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
}
