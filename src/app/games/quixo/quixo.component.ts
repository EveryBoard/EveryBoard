import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { QuixoPartSlice } from 'src/app/games/quixo/QuixoPartSlice';
import { QuixoRules } from 'src/app/games/quixo/QuixoRules';
import { GameComponentUtils } from '../../components/game-components/GameComponentUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/Rules';
import { Player } from 'src/app/jscaip/Player';

@Component({
    selector: 'app-quixo',
    templateUrl: './quixo.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class QuixoComponent extends AbstractGameComponent<QuixoMove, QuixoPartSlice> {
    public static VERBOSE: boolean = false;

    public rules: QuixoRules = new QuixoRules(QuixoPartSlice);

    public slice: QuixoPartSlice = this.rules.node.gamePartSlice;

    public lastMoveCoord: Coord = new Coord(-1, -1);

    public chosenCoord: Coord;

    public chosenDirection: Orthogonal;

    public updateBoard(): void {
        this.slice = this.rules.node.gamePartSlice;
        this.board = this.slice.board;
        const move: QuixoMove = this.rules.node.move;
        if (move) this.lastMoveCoord = move.coord;
        else this.lastMoveCoord = null;
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = null;
    }
    public decodeMove(encodedMove: number): QuixoMove {
        return QuixoMove.decode(encodedMove);
    }
    public encodeMove(move: QuixoMove): number {
        return QuixoMove.encode(move);
    }
    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const player: Player = Player.of(this.board[y][x]);
        const classes: string[] = [];

        classes.push(this.getPlayerClass(player));
        if (coord.equals(this.chosenCoord)) classes.push('selected');
        else if (coord.equals(this.lastMoveCoord)) classes.push('lastmove');
        return classes;
    }
    public onBoardClick(x: number, y: number): MGPValidation {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        const coordLegality: MGPValidation = QuixoMove.isValidCoord(clickedCoord);
        if (coordLegality.isFailure()) {
            return this.cancelMove(coordLegality.reason);
        }
        if (this.board[y][x] === this.slice.getCurrentEnnemy().value) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_ENNEMY_PIECE);
        } else {
            this.chosenCoord = clickedCoord;
            return MGPValidation.SUCCESS;
        }
    }
    public getPossiblesDirections(): [number, number, string][] {
        const infos: [number, number, string][] = [];
        if (this.chosenCoord.x !== 4) infos.push([2, 1, 'RIGHT']);
        if (this.chosenCoord.x !== 0) infos.push([0, 1, 'LEFT']);
        if (this.chosenCoord.y !== 4) infos.push([1, 2, 'DOWN']);
        if (this.chosenCoord.y !== 0) infos.push([1, 0, 'UP']);
        return infos;
    }
    public async chooseDirection(direction: string): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#chooseDirection_' + direction);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.chosenDirection = Orthogonal.factory.fromString(direction);
        return await this.tryMove();
    }
    public async tryMove(): Promise<MGPValidation> {
        const move: QuixoMove = new QuixoMove(this.chosenCoord.x,
                                              this.chosenCoord.y,
                                              this.chosenDirection);
        this.cancelMove();
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
    public getTriangleCoordinate(lx: number, ly: number): string {
        const x: number = this.chosenCoord.x;
        const y: number = this.chosenCoord.y;
        return GameComponentUtils.getTriangleCoordinate(x, y, lx, ly);
    }
}
