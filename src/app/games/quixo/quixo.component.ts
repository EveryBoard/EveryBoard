import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { QuixoState } from 'src/app/games/quixo/QuixoState';
import { QuixoRules } from 'src/app/games/quixo/QuixoRules';
import { GameComponentUtils } from 'src/app/components/game-components/GameComponentUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { QuixoTutorial } from './QuixoTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ActivatedRoute } from '@angular/router';
import { MCTS } from 'src/app/jscaip/MCTS';
import { QuixoMoveGenerator } from './QuixoMoveGenerator';
import { Minimax } from 'src/app/jscaip/Minimax';
import { QuixoHeuristic } from './QuixoHeuristic';

@Component({
    selector: 'app-quixo',
    templateUrl: './quixo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class QuixoComponent extends RectangularGameComponent<QuixoRules, QuixoMove, QuixoState, PlayerOrNone> {

    public QuixoState: typeof QuixoState = QuixoState;

    public state: QuixoState;

    public lastMoveCoord: MGPOptional<Coord> = MGPOptional.empty();

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    public chosenDirection: Orthogonal;

    public victoriousCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer, activatedRoute: ActivatedRoute) {
        super(messageDisplayer, activatedRoute);
        this.setRuleAndNode('Quixo');
        this.availableAIs = [
            new Minimax($localize`Minimax`, this.rules, new QuixoHeuristic(), new QuixoMoveGenerator()),
            new MCTS($localize`MCTS`, new QuixoMoveGenerator(), this.rules),
        ];
        this.encoder = QuixoMove.encoder;
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.state = this.getState();
        this.board = this.state.board;
        this.lastMoveCoord = this.node.previousMove.map((move: QuixoMove) => move.coord);
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
        if (this.chosenCoord.equalsValue(coord)) classes.push('selected-stroke');
        else if (this.lastMoveCoord.equalsValue(coord)) classes.push('last-move-stroke');
        if (this.victoriousCoords.some((c: Coord): boolean => c.equals(coord))) classes.push('victory-stroke');
        return classes;
    }
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        const coordLegality: MGPValidation = QuixoMove.isValidCoord(clickedCoord);
        if (coordLegality.isFailure()) {
            return this.cancelMove(coordLegality.getReason());
        }
        if (this.board[y][x] === this.state.getCurrentOpponent()) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        } else {
            if (this.chosenCoord.equalsValue(clickedCoord)) {
                this.cancelMoveAttempt();
            } else {
                this.chosenCoord = MGPOptional.of(clickedCoord);
            }
            return MGPValidation.SUCCESS;
        }
    }
    public getPossiblesDirections(): Orthogonal[] {
        const directions: Orthogonal[] = [];
        const chosenCoord: Coord = this.chosenCoord.get();
        if (chosenCoord.x !== QuixoState.SIZE - 1) directions.push(Orthogonal.RIGHT);
        if (chosenCoord.x !== 0) directions.push(Orthogonal.LEFT);
        if (chosenCoord.y !== QuixoState.SIZE) directions.push(Orthogonal.DOWN);
        if (chosenCoord.y !== 0) directions.push(Orthogonal.UP);
        return directions;
    }
    public async chooseDirection(direction: Orthogonal): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#chooseDirection_' + direction.toString());
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
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
    public getArrowTransform(orientation: Orthogonal): string {
        return GameComponentUtils.getArrowTransform(QuixoState.SIZE * this.SPACE_SIZE,
                                                    new Coord(0, 0),
                                                    orientation);
    }
}
