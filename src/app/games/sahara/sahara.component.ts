import { Component } from '@angular/core';

import { TriangularGameComponent }
    from 'src/app/components/game-components/abstract-game-component/TriangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { SaharaMinimax, SaharaRules } from 'src/app/games/sahara/SaharaRules';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SaharaPawn } from 'src/app/games/sahara/SaharaPawn';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Minimax } from 'src/app/jscaip/Minimax';

@Component({
    selector: 'app-sahara',
    templateUrl: './sahara.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class SaharaComponent extends TriangularGameComponent<SaharaMove, SaharaPartSlice> {
    public static VERBOSE: boolean = false;

    public availableMinimaxes: Minimax<SaharaMove, SaharaPartSlice>[] = [
        // TODO:does minimax use legality status ????
        new SaharaMinimax('SaharaMinimax'),
    ];
    public rules: SaharaRules = new SaharaRules(SaharaPartSlice);

    public lastCoord: Coord = new Coord(-2, -2);

    public lastMoved: Coord = new Coord(-2, -2);

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    public cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.reason);
        }
        if (this.chosenCoord.isAbsent()) { // Must select pyramid
            if (this.board[y][x] === SaharaPawn.EMPTY) { // Did not select pyramid
                return this.cancelMove('Vous devez d\'abord choisir une de vos pyramides!');
            } else if (this.getTurn() % 2 === this.board[y][x]) { // selected his own pyramid
                this.chosenCoord = MGPOptional.of(clickedCoord);
                return MGPValidation.SUCCESS;
            } else { // Selected ennemy pyramid
                return this.cancelMove('Vous devez choisir une de vos pyramides!');
            }
        } else { // Must choose empty landing case
            let newMove: SaharaMove;
            try {
                newMove = new SaharaMove(this.chosenCoord.get(), clickedCoord);
            } catch (error) {
                return this.cancelMove(error.message);
            }
            return await this.chooseMove(newMove, this.rules.node.gamePartSlice, null, null);
        }
    }
    public updateBoard(): void {
        this.chosenCoord = MGPOptional.empty();
        const move: SaharaMove = this.rules.node.move;
        if (move) {
            this.lastCoord = move.coord;
            this.lastMoved = move.end;
        } else {
            this.lastCoord = null;
            this.lastMoved = null;
        }
        this.board = this.rules.node.gamePartSlice.board;
    }
    public decodeMove(encodedMove: number): SaharaMove {
        return SaharaMove.decode(encodedMove);
    }
    public encodeMove(move: SaharaMove): number {
        return SaharaMove.encode(move);
    }
}
