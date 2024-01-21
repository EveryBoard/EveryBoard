import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { BaseDirection, Direction } from 'src/app/jscaip/Direction';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AbaloneFailure } from './AbaloneFailure';
import { AbaloneState } from './AbaloneState';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneLegalityInformation, AbaloneRules } from './AbaloneRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { AbaloneScoreHeuristic } from './AbaloneScoreHeuristic';
import { AbaloneMoveGenerator } from './AbaloneMoveGenerator';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class HexaDirArrow {
    public constructor(public startCenter: Coord,
                       public middle: Coord,
                       public landingCenter: Coord,
                       public landing: Coord,
                       public dir: HexaDirection,
                       public transformation: string) {}
}

@Component({
    selector: 'app-abalone',
    templateUrl: './abalone.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class AbaloneComponent extends HexagonalGameComponent<AbaloneRules,
                                                             AbaloneMove,
                                                             AbaloneState,
                                                             FourStatePiece,
                                                             EmptyRulesConfig,
                                                             AbaloneLegalityInformation>
{
    public moveds: Coord[] = [];

    public directions: HexaDirArrow[] = [];

    public selecteds: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Abalone');
        this.availableAIs = [
            new Minimax($localize`Score`, this.rules, new AbaloneScoreHeuristic(), new AbaloneMoveGenerator()),
            new MCTS($localize`MCTS`, new AbaloneMoveGenerator(), this.rules),
        ];
        this.encoder = AbaloneMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
        this.SPACE_SIZE = 30;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE,
                                         new Coord(- 8 * this.SPACE_SIZE, 2 * this.SPACE_SIZE),
                                         PointyHexaOrientation.INSTANCE);
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.hexaBoard = this.getState().getCopiedBoard();
        this.scores = MGPOptional.of(this.getState().getScores());
    }
    public override hideLastMove(): void {
        this.moveds = [];
    }
    public override cancelMoveAttempt(): void {
        this.directions = [];
        this.selecteds = [];
    }
    public override async showLastMove(move: AbaloneMove): Promise<void> {
        if (move.isSingleCoord()) {
            this.showPushingMove(move);
        } else {
            this.showSideStepMove(move);
        }
    }
    private showPushingMove(move: AbaloneMove): void {
        const previousState: AbaloneState = this.getPreviousState();
        let moved: Coord = move.coord;
        this.moveds = [moved];
        moved = moved.getNext(move.dir);
        while (AbaloneState.isOnBoard(moved) && previousState.isPiece(moved)) {
            this.moveds.push(moved);
            moved = moved.getNext(move.dir);
        }
        if (AbaloneState.isOnBoard(moved)) {
            this.moveds.push(moved);
        }
    }
    private showSideStepMove(move: AbaloneMove): void {
        let last: Coord = move.lastPiece.get();
        const alignement: HexaDirection = move.coord.getDirectionToward(last).get();
        last = last.getNext(alignement);
        let processed: Coord = move.coord;
        while (processed.equals(last) === false) {
            this.moveds.push(processed);
            this.moveds.push(processed.getNext(move.dir));
            processed = processed.getNext(alignement);
        }
    }
    public async onPieceClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#piece_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const opponent: Player = this.getState().getCurrentOpponent();
        if (this.hexaBoard[y][x].is(opponent)) {
            return this.opponentClick(x, y);
        }
        if (this.selecteds.length === 0) {
            return this.firstClick(x, y);
        } else if (this.selecteds.length === 1) {
            return this.secondClick(x, y);
        } else {
            return this.thirdClick(x, y);
        }
    }
    private async opponentClick(x: number, y: number): Promise<MGPValidation> {
        const directionValidity: MGPValidation = await this.tryChoosingDirection(x, y);
        if (directionValidity.isSuccess()) {
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
    }
    private async firstClick(x: number, y: number): Promise<MGPValidation> {
        this.selecteds = [new Coord(x, y)];
        this.showPossibleDirections();
        return MGPValidation.SUCCESS;
    }
    private showPossibleDirections(): void {
        this.directions = [];
        if (this.selecteds.length === 1) {
            this.showDirection(true);
        } else {
            this.showDirection(false);
        }
    }
    private showDirection(single: boolean): void {
        const state: AbaloneState = this.getState();
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const firstPiece: Coord = this.selecteds[0];
        const lastPiece: Coord = this.selecteds[this.selecteds.length - 1];
        for (const dir of HexaDirection.factory.all) {
            let pointed: Coord = firstPiece.getNext(dir, 1);
            if (state.isOnBoard(pointed) && state.getPieceAt(pointed) === player) {
                if (single) {
                    continue;
                } else {
                    pointed = lastPiece.getNext(dir, 1);
                    if (state.isOnBoard(pointed) && state.getPieceAt(pointed) === player) {
                        continue;
                    }
                }
            }
            let theoritical: AbaloneMove;
            if (single) {
                theoritical = AbaloneMove.ofSingleCoord(firstPiece, dir);
            } else {
                theoritical = AbaloneMove.ofDoubleCoord(firstPiece, lastPiece, dir);
            }
            const isLegal: MGPFallible<AbaloneLegalityInformation> = this.rules.isLegal(theoritical, state);
            if (isLegal.isSuccess()) {
                const firstPieceCenter: Coord = this.getCenterAt(firstPiece);
                const pointedCenter: Coord = this.getCenterAt(pointed);
                const middle: Coord = this.getMiddleOfArrow(dir, pointed, pointedCenter);
                const centerCoord: string = pointedCenter.x + ' ' + pointedCenter.y;
                const angle: number = HexaDirection.getAngle(dir) + 150;
                const rotation: string = 'rotate(' + angle + ' ' + centerCoord + ')';
                const translation: string = 'translate(' + centerCoord + ')';
                const transformation: string = rotation + ' ' + translation;
                const arrow: HexaDirArrow = new HexaDirArrow(firstPieceCenter,
                                                             middle,
                                                             pointedCenter,
                                                             pointed,
                                                             dir,
                                                             transformation);
                this.directions.push(arrow);
            }
        }
    }
    private getMiddleOfArrow(dir: HexaDirection, last: Coord, lastCenter: Coord): Coord {
        const first: Coord = last.getPrevious(dir);
        const firstCenter: Coord = this.getCenterAt(first);
        const halfDx: number = (lastCenter.x - firstCenter.x) / 2;
        const halfDy: number = (lastCenter.y - firstCenter.y) / 2;
        return new Coord(firstCenter.x + halfDx, firstCenter.y + halfDy);
    }
    public isBoard(c: FourStatePiece): boolean {
        return c !== FourStatePiece.UNREACHABLE;
    }
    public isPiece(c: FourStatePiece): boolean {
        return c !== FourStatePiece.EMPTY;
    }
    private async secondClick(x: number, y: number): Promise<MGPValidation> {
        const firstPiece: Coord = this.selecteds[0];
        const coord: Coord = new Coord(x, y);
        if (coord.equals(firstPiece)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        if (coord.isHexagonallyAlignedWith(firstPiece) === false) {
            this.cancelMoveAttempt();
            return this.firstClick(x, y);
        }
        const distance: number = coord.getDistance(firstPiece);
        if (distance > 2) {
            return this.cancelMove(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());
        }
        const alignement: BaseDirection = firstPiece.getDirectionToward(coord).get();
        this.selecteds = [firstPiece];
        for (let i: number = 0; i < distance; i++) {
            this.selecteds.push(firstPiece.getNext(alignement, i + 1));
        }
        if (this.selecteds.length === 3) {
            const middle: Coord = this.selecteds[1];
            const player: Player = this.getState().getCurrentPlayer();
            if (this.hexaBoard[middle.y][middle.x].is(player) === false) {
                this.cancelMoveAttempt();
                return this.firstClick(x, y);
            }
        }
        this.showPossibleDirections();
        return MGPValidation.SUCCESS;
    }
    private async thirdClick(x: number, y: number): Promise<MGPValidation> {
        const clicked: Coord = new Coord(x, y);
        const firstPiece: Coord = this.selecteds[0];
        if (clicked.equals(firstPiece)) {
            return this.deselectExtremity(true);
            // move firstPiece one step closer to lastPiece if possible
        }
        const lastPiece: Coord = this.selecteds[this.selecteds.length - 1];
        if (clicked.equals(lastPiece)) {
            return this.deselectExtremity(false);
            // move lastPiece one step closer to firstPiece if possible
        }
        if (this.selecteds.length === 3 && clicked.equals(this.selecteds[1])) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        return this.tryExtension(clicked, firstPiece, lastPiece);
    }
    private async tryExtension(clicked: Coord, firstPiece: Coord, lastPiece: Coord): Promise<MGPValidation> {
        const alignement: MGPFallible<Direction> = Direction.factory.fromMove(firstPiece, clicked);
        if (alignement.isSuccess()) {
            const secondAlignment: MGPFallible<Direction> = Direction.factory.fromMove(lastPiece, clicked);
            if (alignement.equals(secondAlignment)) {
                // Then it's an extension of the line
                const firstDistance: number = firstPiece.getDistance(clicked);
                const secondDistance: number = lastPiece.getDistance(clicked);
                if (Math.max(firstDistance, secondDistance) === 2) {
                    this.selecteds.push(clicked);
                    ArrayUtils.sortByDescending(this.selecteds, AbaloneMove.sortCoord);
                    this.showPossibleDirections();
                    return MGPValidation.SUCCESS;
                } else {
                    return this.cancelMove(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());
                }
            }
        }
        const legality: MGPValidation = await this.cancelMove(AbaloneFailure.LINE_AND_COORD_NOT_ALIGNED());
        await this.firstClick(clicked.x, clicked.y);
        return legality;
    }
    private async deselectExtremity(first: boolean): Promise<MGPValidation> {
        const start: number = first ? 1 : 0;
        const end: number | undefined = first ? undefined : -1;
        this.selecteds = this.selecteds.slice(start, end);
        this.showPossibleDirections();
        return MGPValidation.SUCCESS;
    }
    public async chooseDirection(dir: HexaDirection): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#direction_' + dir.toString());
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        return this._chooseDirection(dir);
    }
    private async _chooseDirection(dir: HexaDirection): Promise<MGPValidation> {
        const firstPiece: Coord = this.selecteds[0];
        if (this.selecteds.length === 1) {
            const move: AbaloneMove = AbaloneMove.ofSingleCoord(firstPiece, dir);
            return this.chooseMove(move);
        } else {
            const lastPiece: Coord = this.selecteds[this.selecteds.length - 1];
            const move: AbaloneMove = AbaloneMove.ofDoubleCoord(firstPiece, lastPiece, dir);
            return this.chooseMove(move);
        }
    }
    public async onSpaceClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#space_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        return this.tryChoosingDirection(x, y);
    }
    private async tryChoosingDirection(x: number, y: number): Promise<MGPValidation> {
        const clicked: Coord = new Coord(x, y);
        for (const direction of this.directions) {
            if (direction.landing.equals(clicked)) {
                return this._chooseDirection(direction.dir);
            }
        }
        return MGPValidation.failure('not a direction');
    }
    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [];
        if (this.moveds.some((c: Coord) => c.equals(coord))) {
            classes.push('moved-fill');
        }
        return classes;
    }
    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const player: PlayerOrNone = this.hexaBoard[y][x].getPlayer();
        const classes: string[] = [this.getPlayerClass(player)];
        if (this.selecteds.some((c: Coord) => c.equals(coord))) {
            classes.push('selected-stroke');
        }
        return classes;
    }
}
