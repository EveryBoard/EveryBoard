import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { QuixoState } from 'src/app/games/quixo/QuixoState';
import { QuixoRules } from 'src/app/games/quixo/QuixoRules';
import { QuixoMinimax } from 'src/app/games/quixo/QuixoMinimax';
import { GameComponentUtils } from 'src/app/components/game-components/GameComponentUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { QuixoTutorial } from './QuixoTutorial';

@Component({
    selector: 'app-quixo',
    templateUrl: './quixo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class QuixoComponent extends RectangularGameComponent<QuixoRules, QuixoMove, QuixoState, Player> {

    public static VERBOSE: boolean = false;

    public state: QuixoState;

    public lastMoveCoord: Coord = new Coord(-1, -1);

    public chosenCoord: Coord;

    public chosenDirection: Orthogonal;

    public victoriousCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new QuixoRules(QuixoState);
        this.availableMinimaxes = [
            new QuixoMinimax(this.rules, 'QuixoMinimax'),
        ];
        this.encoder = QuixoMove.encoder;
        this.tutorial = new QuixoTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        this.state = this.rules.node.gameState;
        this.board = this.state.board;
        const move: QuixoMove = this.rules.node.move;
        if (move) this.lastMoveCoord = move.coord;
        else this.lastMoveCoord = null;
        this.victoriousCoords = QuixoRules.getVictoriousCoords(this.state);
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = null;
    }
    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const player: Player = this.board[y][x];
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
        if (this.board[y][x] === this.state.getCurrentOpponent()) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
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
        this.chosenDirection = Orthogonal.factory.fromString(direction).get();
        return await this.tryMove();
    }
    public async tryMove(): Promise<MGPValidation> {
        const move: QuixoMove = new QuixoMove(this.chosenCoord.x,
                                              this.chosenCoord.y,
                                              this.chosenDirection);
        this.cancelMove();
        return this.chooseMove(move, this.rules.node.gameState, null, null);
    }
    public getArrowTransform(coord: Coord, orientation: string): string {
        return GameComponentUtils.getArrowTransform(this.SPACE_SIZE,
                                                    coord,
                                                    Orthogonal.factory.fromString(orientation).get());
    }
}
