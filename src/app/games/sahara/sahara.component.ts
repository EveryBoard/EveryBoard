import { Component } from '@angular/core';

import { TriangularGameComponent }
    from 'src/app/components/game-components/abstract-game-component/TriangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { SaharaRules } from 'src/app/games/sahara/SaharaRules';
import { SaharaMinimax } from 'src/app/games/sahara/SaharaMinimax';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SaharaPawn } from 'src/app/games/sahara/SaharaPawn';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';

@Component({
    selector: 'app-sahara',
    templateUrl: './sahara.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class SaharaComponent extends TriangularGameComponent<SaharaMove, SaharaPartSlice> {
    public static VERBOSE: boolean = false;

    public lastCoord: Coord = new Coord(-2, -2);

    public lastMoved: Coord = new Coord(-2, -2);

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    public encoder: MoveEncoder<SaharaMove> = SaharaMove.encoder;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new SaharaRules(SaharaPartSlice);
        this.availableMinimaxes = [
            new SaharaMinimax(this.rules, 'SaharaMinimax'),
        ];
    }
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
            return this.choosePiece(x, y);
        } else { // Must choose empty landing case
            const currentPlayer: Player = this.rules.node.gamePartSlice.getCurrentPlayer();
            const PLAYER: number = currentPlayer === Player.ZERO ? SaharaPawn.BLACK : SaharaPawn.WHITE;
            if (this.board[y][x] === PLAYER) {
                this.chosenCoord = MGPOptional.of(new Coord(x, y));
                return MGPValidation.SUCCESS;
            }
            let newMove: SaharaMove;
            try {
                newMove = new SaharaMove(this.chosenCoord.get(), clickedCoord);
            } catch (error) {
                return this.cancelMove(error.message);
            }
            return await this.chooseMove(newMove, this.rules.node.gamePartSlice, null, null);
        }
    }
    private choosePiece(x: number, y: number): MGPValidation {
        if (this.board[y][x] === SaharaPawn.EMPTY) { // Did not select pyramid
            return this.cancelMove('Vous devez d\'abord choisir une de vos pyramides!');
        } else if (this.getTurn() % 2 === this.board[y][x]) { // selected his own pyramid
            this.chosenCoord = MGPOptional.of(new Coord(x, y));
            return MGPValidation.SUCCESS;
        } else { // Selected ennemy pyramid
            return this.cancelMove('Vous devez choisir une de vos pyramides!');
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
}
