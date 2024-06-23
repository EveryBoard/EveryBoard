import { ChangeDetectorRef, Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils, MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { AbaloneFailure } from './AbaloneFailure';
import { AbaloneState } from './AbaloneState';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneLegalityInformation, AbaloneRules } from './AbaloneRules';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { AbaloneMoveGenerator } from './AbaloneMoveGenerator';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Arrow } from 'src/app/components/game-components/arrow-component/Arrow';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { AbaloneScoreMinimax } from './AbaloneScoreMinimax';

type CapturedInfo = {
    coord: Coord,
    pieceClasses: string[],
};

type AbaloneArrowInfo = {

    start: Coord;

    end: Coord;

    pointed: Coord;
};

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

    public captureds: CapturedInfo[] = [];

    public directions: Arrow<HexaDirection>[] = [];

    public selecteds: Coord[] = [];

    public boardNeighboringCoords: Coord[] = AbaloneRules
        .get()
        .getInitialState()
        .getCoordsAndContents()
        .flatMap((coordAndContent: { coord: Coord }) => coordAndContent.coord.getOrdinalNeighbors());

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Abalone');
        this.availableAIs = [
            new AbaloneScoreMinimax(),
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
        this.captureds = [];
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
        } else {
            const fallenPieceCoord: Coord = moved.getPrevious(move.dir);
            const fallenPlayer: FourStatePiece = previousState.getPieceAt(fallenPieceCoord);
            this.captureds = [{
                coord: moved,
                pieceClasses: [this.getPlayerClass(fallenPlayer.getPlayer())],
            }];
        }
    }

    private showSideStepMove(move: AbaloneMove): void {
        let last: Coord = move.lastPiece.get();
        const alignement: HexaDirection = move.coord.getDirectionToward(last).get();
        last = last.getNext(alignement);
        let processed: Coord = move.coord;
        while (processed.equals(last) === false) {
            this.moveds.push(processed);
            const landing: Coord = processed.getNext(move.dir);
            if (AbaloneState.isOnBoard(landing)) {
                this.moveds.push(landing);
            } else {
                // Since only current player could have translated out their pieces
                const previousPlayer: Player = this.getPreviousState().getCurrentPlayer();
                this.captureds.push({
                    coord: landing,
                    pieceClasses: [this.getPlayerClass(previousPlayer)],
                });
            }
            processed = processed.getNext(alignement);
        }
    }

    public async onPieceClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#piece_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        return this.onLegalPieceClick(x, y);
    }

    private onLegalPieceClick(x: number, y: number): MGPValidation | PromiseLike<MGPValidation> {
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
        return this.tryChoosingDirection(x, y);
    }

    private async firstClick(x: number, y: number): Promise<MGPValidation> {
        this.selecteds = [new Coord(x, y)];
        this.showPossibleDirections();
        return MGPValidation.SUCCESS;
    }

    private showPossibleDirections(): void {
        this.directions = [];
        Utils.assert(this.selecteds.length > 0, 'do not call showPossibleDirections if there is no selected piece');
        this.showDirection();
    }

    private showDirection(): void {
        const state: AbaloneState = this.getState();
        for (const dir of HexaDirection.factory.all) {
            const startToEnd: AbaloneArrowInfo = this.getArrowPath(dir);
            let theoretical: AbaloneMove;
            if (this.selecteds.length === 1) {
                theoretical = AbaloneMove.ofSingleCoord(startToEnd.start, dir);
            } else {
                theoretical = AbaloneMove.ofDoubleCoord(startToEnd.start, startToEnd.end, dir);
            }
            const isLegal: MGPFallible<AbaloneLegalityInformation> = this.rules.isLegal(theoretical, state);
            if (isLegal.isSuccess()) {
                const arrow: Arrow<HexaDirection> =
                    new Arrow<HexaDirection>(startToEnd.start,
                                             startToEnd.pointed,
                                             dir,
                                             (c: Coord) => this.hexaLayout.getCenterAt(c));
                this.directions.push(arrow);
            }
        }
    }

    private getArrowPath(direction: HexaDirection): AbaloneArrowInfo {
        let start: Coord = this.selecteds[0];
        let end: Coord = this.selecteds[this.selecteds.length - 1];
        if (this.selecteds.length > 1 &&
            start.getDirectionToward(end).get().equals(direction.getOpposite()))
        {
            // If we selected (B, C) and a move from C to A is possible, then we swap them
            // So the drawn line goes from C to A instead of only B to A.
            const tmp: Coord = start;
            start = end;
            end = tmp;
        }
        return { start, end, pointed: this.getPointed(start, end, direction) };
    }

    private getPointed(start: Coord, end: Coord, direction: HexaDirection): Coord {
        const isPush: boolean = this.selecteds.length === 1 || start.getDirectionToward(end).get().equals(direction);
        if (isPush) {
            const state: AbaloneState = this.getState();
            const currentPlayer: Player = state.getCurrentPlayer();
            let pointed: Coord = end;
            while (state.isOnBoard(pointed) && state.getPieceAt(pointed).is(currentPlayer)) {
                pointed = pointed.getNext(direction, 1);
            }
            return pointed;
        } else {
            return start.getNext(direction, 1);
        }
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
            return this.cancelMove();
        }
        if (coord.isHexagonallyAlignedWith(firstPiece) === false) {
            return this.firstClick(x, y);
        }
        const distance: number = coord.getLinearDistanceToward(firstPiece);
        if (distance > 2) {
            return this.cancelMove(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());
        }
        const alignement: Direction = firstPiece.getDirectionToward(coord).get();
        this.selecteds = [firstPiece];
        for (let i: number = 0; i < distance; i++) {
            this.selecteds.push(firstPiece.getNext(alignement, i + 1));
        }
        if (this.selecteds.length === 3) {
            const middle: Coord = this.selecteds[1];
            const player: Player = this.getState().getCurrentPlayer();
            if (this.hexaBoard[middle.y][middle.x].is(player) === false) {
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
            return this.cancelMove();
        }
        return this.tryExtension(clicked, firstPiece, lastPiece);
    }

    private async tryExtension(clicked: Coord, firstPiece: Coord, lastPiece: Coord): Promise<MGPValidation> {
        const alignement: MGPFallible<Ordinal> = Ordinal.factory.fromMove(firstPiece, clicked);
        if (alignement.isSuccess()) {
            const secondAlignment: MGPFallible<Ordinal> = Ordinal.factory.fromMove(lastPiece, clicked);
            if (alignement.equals(secondAlignment)) {
                // Then it's an extension of the line
                const firstDistance: number = firstPiece.getLinearDistanceToward(clicked);
                const secondDistance: number = lastPiece.getLinearDistanceToward(clicked);
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
        if (this.getState().getPieceAtXY(x, y).isPlayer()) {
            return this.onLegalPieceClick(x, y);
        }
        if (this.selecteds.length === 0) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else {
            return this.tryChoosingDirection(x, y);
        }
    }

    private async tryChoosingDirection(x: number, y: number): Promise<MGPValidation> {
        const clicked: Coord = new Coord(x, y);
        for (const direction of this.directions) {
            if (direction.landing.equals(clicked)) {
                return this._chooseDirection(direction.dir);
            }
        }
        return this.cancelMove();
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
