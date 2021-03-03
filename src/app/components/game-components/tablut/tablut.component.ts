import { Component } from '@angular/core';

import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { Coord } from '../../../jscaip/coord/Coord';
import { TablutMove } from 'src/app/games/tablut/tablut-move/TablutMove';
import { TablutPartSlice } from '../../../games/tablut/TablutPartSlice';
import { TablutRules } from '../../../games/tablut/tablut-rules/TablutRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { TablutCase } from 'src/app/games/tablut/tablut-rules/TablutCase';
import { display } from 'src/app/utils/collection-lib/utils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { Player } from 'src/app/jscaip/player/Player';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { TablutRulesConfig } from 'src/app/games/tablut/tablut-rules/TablutRulesConfig';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';

@Component({
    selector: 'app-tablut',
    templateUrl: './tablut.component.html',
})
export class TablutComponent extends AbstractGameComponent<TablutMove, TablutPartSlice, LegalityStatus> {
    public static VERBOSE: boolean = false;

    public NONE: number = TablutCase.UNOCCUPIED.value;

    public rules: TablutRules = new TablutRules(TablutPartSlice);

    public throneCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, 8),
        new Coord(4, 4),
        new Coord(8, 0),
        new Coord(8, 8),
    ];
    private captureds: Coord[] = [];

    public chosen: Coord = new Coord(-1, -1);

    public lastMove: TablutMove;

    public updateBoard(): void {
        display(TablutComponent.VERBOSE, 'tablutComponent.updateBoard');
        this.lastMove = this.rules.node.move;
        this.board = this.rules.node.gamePartSlice.getCopiedBoard();

        this.captureds = [];
        if (this.lastMove) {
            this.showPreviousMove();
        }
    }
    private showPreviousMove(): void {
        const previousBoard: NumberTable = this.rules.node.mother.gamePartSlice.board;
        const ENNEMY: Player = this.rules.node.gamePartSlice.getCurrentEnnemy();
        for (const orthogonal of Orthogonal.ORTHOGONALS) {
            const captured: Coord = this.lastMove.end.getNext(orthogonal, 1);
            if (captured.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) {
                const previously: RelativePlayer = TablutRules.getRelativeOwner(ENNEMY, captured, previousBoard)
                const wasEnnemy: boolean = previously === RelativePlayer.ENNEMY;
                const currently: number = this.rules.node.gamePartSlice.getBoardAt(captured);
                const isEmpty: boolean = currently === TablutCase.UNOCCUPIED.value;
                if (wasEnnemy && isEmpty) {
                    this.captureds.push(captured);
                }
            }
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.onClick(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else {
            return this.chooseDestination(x, y);
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        let move: TablutMove;
        try {
            move = new TablutMove(chosenPiece, chosenDestination);
        } catch (error) {
            return this.cancelMove(error.message);
        }
        this.cancelMove();
        return await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
    public choosePiece(x: number, y: number): MGPValidation {
        display(TablutComponent.VERBOSE, 'TablutComponent.choosePiece');

        if (this.board[y][x] === TablutCase.UNOCCUPIED.value) {
            return this.cancelMove('Pour votre premier clic, choisissez une de vos pièces.');
        }
        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            return this.cancelMove('Cette pièce ne vous appartient pas.');
        }

        this.chosen = new Coord(x, y);
        display(TablutComponent.VERBOSE, 'selected piece = (' + x + ', ' + y + ')');
        return MGPValidation.SUCCESS;
    }
    public pieceBelongToCurrentPlayer(x: number, y: number): boolean {
        // TODO: see that verification is done and refactor this shit
        const player: Player = this.rules.node.gamePartSlice.getCurrentPlayer();
        const coord: Coord = new Coord(x, y);
        return TablutRules.getRelativeOwner(player, coord, this.board) === RelativePlayer.PLAYER;
    }
    public cancelMoveAttempt(): void {
        this.chosen = new Coord(-1, -1);
    }
    public isThrone(x: number, y: number): boolean {
        return TablutRules.isThrone(new Coord(x, y));
    }
    public decodeMove(encodedMove: number): TablutMove {
        return TablutMove.decode(encodedMove);
    }
    public encodeMove(move: TablutMove): number {
        return move.encode();
    }
    public getPieceStyle(x: number, y: number): any {
        const coord: Coord = new Coord(x, y);
        const owner: Player = TablutRules.getAbsoluteOwner(coord, this.board);
        const fill: string = this.getPlayerColor(owner);
        const stroke: string = this.getPieceStroke(x, y);
        return { fill, stroke };
    }
    public getPieceStroke(x: number, y: number): string {
        const coord: Coord = new Coord(x, y);
        if (this.chosen.equals(coord)) {
            return 'yellow';
        } else {
            return null;
        }
    }
    public getRectFill(x: number, y: number): string {
        const coord: Coord = new Coord(x, y);
        const lastStart: Coord = this.lastMove ? this.lastMove.coord : null;
        const lastEnd: Coord = this.lastMove ? this.lastMove.end : null;
        if (this.captureds.some((c: Coord) => c.equals(coord))) {
            return this.CAPTURED_FILL;
        } else if (coord.equals(lastStart) ||
                   coord.equals(lastEnd)) {
            return this.MOVED_FILL;
        } else {
            return this.NORMAL_FILL;
        }
    }
    public getRectStyle(x: number, y: number): unknown {
        if (this.isClickable(x, y)) {
            return this.CLICKABLE_STYLE;
        } else {
            return null;
        }
    }
    private isClickable(x: number, y: number): boolean {
        // Show if the piece can be clicked
        return this.pieceBelongToCurrentPlayer(x, y);
    }
    public isInvader(x: number, y: number): boolean {
        return this.board[y][x] === TablutCase.INVADERS.value;
    }
    public isKing(x: number, y: number): boolean {
        return TablutRules.isKing(this.board[y][x]);
    }
    public getKingPolyline(x: number, y: number): string {
        const ax: number = 85 + 100*x; const ay: number = 85 + 100*y;
        const bx: number = 30 + 100*x; const by: number = 30 + 100*y;
        const cx: number = 50 + 100*x; const cy: number = 10 + 100*y;
        const dx: number = 70 + 100*x; const dy: number = 30 + 100*y;
        const ex: number = 15 + 100*x; const ey: number = 85 + 100*y;
        return ax + ' ' + ay + ' ' +
               bx + ' ' + by + ' ' +
               cx + ' ' + cy + ' ' +
               dx + ' ' + dy + ' ' +
               ex + ' ' + ey;
    }
}
