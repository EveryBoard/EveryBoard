import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { QuixoPartSlice } from 'src/app/games/quixo/QuixoPartSlice';
import { QuixoRules } from 'src/app/games/quixo/QuixoRules';
import { QuixoMinimax } from 'src/app/games/quixo/QuixoMinimax';
import { GameComponentUtils } from 'src/app/components/game-components/GameComponentUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player } from 'src/app/jscaip/Player';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { quixoTutorial } from './QuixoTutorial';

@Component({
    selector: 'app-quixo',
    templateUrl: './quixo.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class QuixoComponent extends AbstractGameComponent<QuixoMove, QuixoPartSlice> {
    public static VERBOSE: boolean = false;

    public CASE_SIZE: number = 100;

    public slice: QuixoPartSlice;

    public lastMoveCoord: Coord = new Coord(-1, -1);

    public chosenCoord: Coord;

    public chosenDirection: Orthogonal;

    public victoriousCoords: Coord[] = [];

    public encoder: MoveEncoder<QuixoMove> = QuixoMove.encoder;

    public tutorial: DidacticialStep[] = quixoTutorial;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new QuixoRules(QuixoPartSlice);
        this.slice = this.rules.node.gamePartSlice;
        this.availableMinimaxes = [
            new QuixoMinimax(this.rules, 'QuixoMinimax'),
        ];
    }
    public updateBoard(): void {
        this.slice = this.rules.node.gamePartSlice;
        this.board = this.slice.board;
        const move: QuixoMove = this.rules.node.move;
        if (move) this.lastMoveCoord = move.coord;
        else this.lastMoveCoord = null;
        this.victoriousCoords = QuixoRules.getVictoriousCoords(this.slice);
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = null;
    }
    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const player: Player = Player.of(this.board[y][x]);
        const classes: string[] = [];

        classes.push(this.getPlayerClass(player));
        if (coord.equals(this.chosenCoord)) classes.push('selected');
        else if (coord.equals(this.lastMoveCoord)) classes.push('last-move');
        if (this.victoriousCoords.some((c: Coord): boolean => c.equals(coord))) classes.push('victory-stroke');
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
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE);
        } else {
            this.chosenCoord = clickedCoord;
            return MGPValidation.SUCCESS;
        }
    }
    public getPossiblesDirections(): string[] {
        const directions: string[] = [];
        if (this.chosenCoord.x !== 4) directions.push('RIGHT');
        if (this.chosenCoord.x !== 0) directions.push('LEFT');
        if (this.chosenCoord.y !== 4) directions.push('DOWN');
        if (this.chosenCoord.y !== 0) directions.push('UP');
        return directions;
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
    public getArrowTransform(coord: Coord, orientation: string): string {
        return GameComponentUtils.getArrowTransform(this.CASE_SIZE, coord, Orthogonal.factory.fromString(orientation));
    }
}
