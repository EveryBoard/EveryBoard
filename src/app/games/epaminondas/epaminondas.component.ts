import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from 'src/app/games/epaminondas/EpaminondasRules';
import { EpaminondasMinimax } from 'src/app/games/epaminondas/EpaminondasMinimax';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { PositionalEpaminondasMinimax } from './PositionalEpaminondasMinimax';
import { AttackEpaminondasMinimax } from './AttackEpaminondasMinimax';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { EpaminondasFailure } from './EpaminondasFailure';
import { EpaminondasTutorial } from './EpaminondasTutorial';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-epaminondas',
    templateUrl: './epaminondas.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class EpaminondasComponent extends RectangularGameComponent<EpaminondasRules,
                                                                   EpaminondasMove,
                                                                   EpaminondasState,
                                                                   Player,
                                                                   EpaminondasLegalityInformation>
{
    public NONE: Player = Player.NONE;

    public firstPiece: MGPOptional<Coord> = MGPOptional.empty();

    private validExtensions: Coord[] = [];

    private phalanxValidLandings: Coord[] = [];

    public lastPiece: MGPOptional<Coord> = MGPOptional.empty();

    private phalanxDirection: MGPOptional<Direction> = MGPOptional.empty();

    private phalanxMiddles: Coord[] = [];

    private moveds: Coord[] = [];

    private captureds: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new EpaminondasRules(EpaminondasState);
        this.availableMinimaxes = [
            new EpaminondasMinimax(this.rules, 'Normal'),
            new PositionalEpaminondasMinimax(this.rules, 'Positional'),
            new AttackEpaminondasMinimax(this.rules, 'Attack'),
        ];
        this.encoder = EpaminondasMove.encoder;
        this.tutorial = new EpaminondasTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        this.firstPiece = MGPOptional.empty();
        this.lastPiece = MGPOptional.empty();
        this.hidePreviousMove();
        if (this.rules.node.move.isPresent()) {
            this.showPreviousMove();
        }
        this.board = this.rules.node.gameState.getCopiedBoard();
    }
    private showPreviousMove() {
        const move: EpaminondasMove = this.rules.node.move.get();
        let moved: Coord = move.coord;
        this.moveds = [moved];
        for (let i: number = 1; i < (move.stepSize + move.movedPieces); i++) {
            moved = moved.getNext(move.direction, 1);
            this.moveds.push(moved);
        }
        const previousNode: EpaminondasNode = this.rules.node.mother.get();
        const PREVIOUS_OPPONENT: Player = previousNode.gameState.getCurrentOpponent();
        while (moved.isInRange(14, 12) &&
               previousNode.gameState.getPieceAt(moved) === PREVIOUS_OPPONENT) {
            this.captureds.push(moved);
            moved = moved.getNext(move.direction, 1);
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.firstPiece.isAbsent()) {
            return this.firstClick(x, y);
        } else if (this.lastPiece.isAbsent()) {
            return this.secondClick(x, y);
        } else {
            return this.thirdClick(x, y);
        }
    }
    private async firstClick(x: number, y: number): Promise<MGPValidation> {
        const OPPONENT: Player = this.rules.node.gameState.getCurrentOpponent();
        const PLAYER: Player = this.rules.node.gameState.getCurrentPlayer();
        switch (this.board[y][x]) {
            case PLAYER:
                this.firstPiece = MGPOptional.of(new Coord(x, y));
                this.validExtensions = this.getValidExtensions(PLAYER);
                this.phalanxValidLandings = this.getPhalanxValidLandings();
                return MGPValidation.SUCCESS;
            case OPPONENT:
                return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
            default:
                Utils.expectToBe(this.board[y][x], Player.NONE);
                return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
    }
    private hidePreviousMove() {
        this.captureds = [];
        this.moveds = [];
    }
    private getValidExtensions(PLAYER: Player): Coord[] {
        if (this.lastPiece.isPresent()) {
            return this.getPhalanxValidExtensions(PLAYER);
        } else {
            return this.getFirstPieceExtensions(PLAYER);
        }
    }
    private getFirstPieceExtensions(PLAYER: Player): Coord[] {
        const extensions: Coord[] = [];
        for (const direction of Direction.DIRECTIONS) {
            let coord: Coord = this.firstPiece.get().getNext(direction, 1);
            while (coord.isInRange(14, 12) &&
                   this.board[coord.y][coord.x] === PLAYER) {
                extensions.push(coord);
                coord = coord.getNext(direction, 1);
            }
        }
        return extensions;
    }
    private getPhalanxValidExtensions(PLAYER: Player): Coord[] {
        let direction: Direction = Direction.factory.fromMove(this.firstPiece.get(), this.lastPiece.get()).get();
        const forward: Coord = this.lastPiece.get().getNext(direction, 1);
        const extensionForward: Coord[] = this.getExtensionsToward(forward, direction, PLAYER);

        direction = direction.getOpposite();
        const backWard: Coord = this.firstPiece.get().getNext(direction, 1);
        const extensionsBackward: Coord[] = this.getExtensionsToward(backWard, direction, PLAYER);
        return extensionForward.concat(extensionsBackward);
    }
    private getExtensionsToward(coord: Coord, direction: Direction, PLAYER: Player): Coord[] {
        const extensions: Coord[] = [];
        while (coord.isInRange(14, 12) &&
               this.board[coord.y][coord.x] === PLAYER) {
            extensions.push(coord);
            coord = coord.getNext(direction, 1);
        }
        return extensions;
    }
    private getPhalanxValidLandings(): Coord[] {
        if (this.lastPiece.isPresent()) {
            const firstPiece: Coord = this.firstPiece.get();
            const lastPiece: Coord = this.lastPiece.get();
            const dx: number = Math.abs(firstPiece.x - lastPiece.x);
            const dy: number = Math.abs(firstPiece.y - lastPiece.y);
            const phalanxSize: number = Math.max(dx, dy) + 1;

            let direction: Direction = Direction.factory.fromMove(firstPiece, lastPiece).get();
            const landingForward: Coord = lastPiece.getNext(direction, 1);
            const landingsForward: Coord[] = this.getLandingsToward(landingForward, direction, phalanxSize);

            direction = direction.getOpposite();
            const landingBackward: Coord = firstPiece.getNext(direction, 1);
            const landingsBackward: Coord[] = this.getLandingsToward(landingBackward, direction, phalanxSize);
            return landingsBackward.concat(landingsForward);
        } else {
            return this.getNeighbooringEmptyCases();
        }
    }
    private getNeighbooringEmptyCases(): Coord[] {
        const neighboors: Coord[] = [];
        for (const direction of Direction.DIRECTIONS) {
            const coord: Coord = this.firstPiece.get().getNext(direction, 1);
            if (coord.isInRange(14, 12) &&
                this.board[coord.y][coord.x] === Player.NONE) {
                neighboors.push(coord);
            }
        }
        return neighboors;
    }
    private getLandingsToward(landing: Coord, direction: Direction, phalanxSize: number): Coord[] {
        const PLAYER: Player = this.rules.node.gameState.getCurrentPlayer();
        const OPPONENT: Player = this.rules.node.gameState.getCurrentOpponent();
        const landings: Coord[] = [];
        while (landing.isInRange(14, 12) &&
               landings.length < phalanxSize &&
               this.board[landing.y][landing.x] !== PLAYER) {
            if (this.board[landing.y][landing.x] === OPPONENT) {
                if (this.getPhalanxLength(landing, direction, OPPONENT) < phalanxSize) {
                    landings.push(landing);
                }
                return landings;
            } else {
                landings.push(landing);
                landing = landing.getNext(direction, 1);
            }
        }
        return landings;
    }
    private getPhalanxLength(firstPiece: Coord, direction: Direction, owner: Player): number {
        let length: number = 0;
        while (firstPiece.isInRange(14, 12) &&
               this.board[firstPiece.y][firstPiece.x] === owner)
        {
            length++;
            firstPiece = firstPiece.getNext(direction, 1);
        }
        return length;
    }
    public cancelMoveAttempt(): void {
        this.firstPiece = MGPOptional.empty();
        this.validExtensions = [];
        this.phalanxValidLandings = [];
        this.lastPiece = MGPOptional.empty();
        this.phalanxMiddles = [];
        this.hidePreviousMove();
    }
    private async secondClick(x: number, y: number): Promise<MGPValidation> {
        const clicked: Coord = new Coord(x, y);
        const firstPiece: Coord = this.firstPiece.get();
        if (clicked.equals(firstPiece)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const OPPONENT: Player = this.rules.node.gameState.getCurrentOpponent();
        const PLAYER: Player = this.rules.node.gameState.getCurrentPlayer();
        if (!clicked.isAlignedWith(firstPiece)) {
            return this.cancelMove(EpaminondasFailure.CASE_NOT_ALIGNED_WITH_SELECTED());
        }
        const distance: number = clicked.getDistance(firstPiece);
        const direction: Direction = firstPiece.getDirectionToward(clicked).get();
        switch (this.board[y][x]) {
            case Player.NONE:
                if (distance === 1) {
                    return this.tryMove(new EpaminondasMove(firstPiece.x, firstPiece.y, 1, 1, direction));
                } else {
                    return this.cancelMove(EpaminondasFailure.SINGLE_PIECE_MUST_MOVE_BY_ONE());
                }
            case OPPONENT:
                return this.cancelMove(EpaminondasFailure.SINGLE_PIECE_CANNOT_CAPTURE());
            default:
                Utils.expectToBe(this.board[y][x], PLAYER);
                const incompleteMove: EpaminondasMove = new EpaminondasMove(firstPiece.x,
                                                                            firstPiece.y,
                                                                            distance,
                                                                            1,
                                                                            direction);
                const state: EpaminondasState = this.rules.node.gameState;
                const phalanxValidity: MGPValidation = EpaminondasRules.getPhalanxValidity(state, incompleteMove);
                if (phalanxValidity.isFailure()) {
                    return this.cancelMove(phalanxValidity.getReason());
                } else {
                    this.lastPiece = MGPOptional.of(clicked);
                    this.validExtensions = this.getValidExtensions(PLAYER);
                    this.phalanxValidLandings = this.getPhalanxValidLandings();
                    this.phalanxMiddles = firstPiece.getCoordsToward(clicked);
                    this.phalanxDirection = MGPOptional.of(direction);
                    return MGPValidation.SUCCESS;
                }
        }
    }
    private async thirdClick(x: number, y: number): Promise<MGPValidation> {
        const PLAYER: Player = this.rules.node.gameState.getCurrentPlayer();
        const clicked: Coord = new Coord(x, y);
        if (this.firstPiece.equalsValue(clicked)) {
            return this.moveFirstPiece(PLAYER);
        }
        if (this.lastPiece.equalsValue(clicked)) {
            return this.moveLastPiece(PLAYER);
        }
        const firstPiece: Coord = this.firstPiece.get();
        const lastPiece: Coord = this.lastPiece.get();
        if (!clicked.isAlignedWith(firstPiece)) {
            return this.cancelMove(EpaminondasFailure.CASE_NOT_ALIGNED_WITH_PHALANX());
        }
        // The directions are valid because they are is aligned
        let phalanxDirection: Direction = Direction.factory.fromMove(firstPiece, lastPiece).get();
        const phalanxLanding: Direction = Direction.factory.fromMove(firstPiece, clicked).get();
        if (phalanxDirection === phalanxLanding.getOpposite()) {
            this.firstPiece = MGPOptional.of(lastPiece);
            this.lastPiece = MGPOptional.of(firstPiece);
            phalanxDirection = phalanxLanding;
        }
        if (phalanxDirection !== phalanxLanding) {
            return this.cancelMove(EpaminondasFailure.CASE_NOT_ALIGNED_WITH_PHALANX());
        }
        if (this.board[y][x] === PLAYER) {
            this.lastPiece = MGPOptional.of(clicked);
            const phalanxSize: number = this.firstPiece.get().getDistance(clicked) + 1;
            const incompleteMove: EpaminondasMove = new EpaminondasMove(this.firstPiece.get().x,
                                                                        this.firstPiece.get().y,
                                                                        phalanxSize,
                                                                        1,
                                                                        phalanxDirection);
            const phalanxValidity: MGPValidation = EpaminondasRules.getPhalanxValidity(this.rules.node.gameState,
                                                                                       incompleteMove);
            if (phalanxValidity.isFailure()) {
                return this.cancelMove(phalanxValidity.getReason());
            } else {
                this.phalanxMiddles = this.firstPiece.get().getCoordsToward(this.lastPiece.get());
                this.validExtensions = this.getValidExtensions(PLAYER);
                this.phalanxValidLandings = this.getPhalanxValidLandings();
                return MGPValidation.SUCCESS;
            }
        } else {
            const phalanxSize: number = this.firstPiece.get().getDistance(this.lastPiece.get()) + 1;
            const stepSize: number = this.lastPiece.get().getDistance(clicked);
            const move: EpaminondasMove = new EpaminondasMove(this.firstPiece.get().x,
                                                              this.firstPiece.get().y,
                                                              phalanxSize,
                                                              stepSize,
                                                              phalanxDirection);
            return this.tryMove(move);
        }
    }
    private async moveFirstPiece(player: Player): Promise<MGPValidation> {
        this.firstPiece = MGPOptional.of(this.firstPiece.get().getNext(this.phalanxDirection.get(), 1));
        if (this.firstPiece.equals(this.lastPiece)) {
            await this.moveOnlyPiece(player);
        } else {
            this.phalanxMiddles = this.phalanxMiddles.slice(1);
            this.validExtensions = this.getPhalanxValidExtensions(player);
        }

        this.phalanxValidLandings = this.getPhalanxValidLandings();
        return MGPValidation.SUCCESS;
    }
    private async moveLastPiece(player: Player): Promise<MGPValidation> {
        this.lastPiece = MGPOptional.of(this.lastPiece.get().getPrevious(this.phalanxDirection.get(), 1));
        if (this.firstPiece.equals(this.lastPiece)) {
            return this.moveOnlyPiece(player);
        } else {
            this.phalanxMiddles = this.firstPiece.get().getCoordsToward(this.lastPiece.get());
            this.validExtensions = this.getPhalanxValidExtensions(player);
        }

        this.phalanxValidLandings = this.getPhalanxValidLandings();
        return MGPValidation.SUCCESS;
    }
    private async moveOnlyPiece(player: Player): Promise<MGPValidation> {
        this.lastPiece = MGPOptional.empty();
        this.validExtensions = this.getFirstPieceExtensions(player);
        this.phalanxDirection = MGPOptional.empty();
        this.phalanxMiddles = [];
        this.phalanxValidLandings = this.getPhalanxValidLandings();
        return MGPValidation.SUCCESS;
    }
    public tryMove(move: EpaminondasMove): Promise<MGPValidation> {
        const state: EpaminondasState = this.rules.node.gameState;
        this.cancelMove();
        return this.chooseMove(move, state);
    }
    public getPieceClasses(x: number, y: number): string[] {
        const player: string = this.getPlayerClass(this.board[y][x]);
        const stroke: string[] = this.getPieceStrokeClasses(x, y);
        return stroke.concat([player]);
    }
    private getPieceStrokeClasses(x: number, y: number): string[] {
        // Show pieces belonging to the phalanx to move
        const coord: Coord = new Coord(x, y);
        if (this.firstPiece.isAbsent()) {
            return [];
        }
        if (this.firstPiece.equalsValue(coord) ||
            this.lastPiece.equalsValue(coord) ||
            this.phalanxMiddles.some((c: Coord) => c.equals(coord))) {
            return ['highlighted'];
        } else {
            return [];
        }
    }
    public getRectClasses(x: number, y: number): string[] {
        const clicked: Coord = new Coord(x, y);
        if (this.captureds.some((c: Coord) => c.equals(clicked))) {
            return ['captured'];
        } else if (this.moveds.some((c: Coord) => c.equals(clicked))) {
            return ['moved'];
        }
        return [];
    }
    public getHighlightedCoords(): Coord[] {
        if (this.firstPiece.isPresent()) {
            return this.phalanxValidLandings.concat(this.validExtensions);
        } else {
            return this.getCurrentPlayerPieces();
        }
    }
    private getCurrentPlayerPieces(): Coord[] {
        const pieces: Coord[] = [];
        const state: EpaminondasState = this.rules.node.gameState;
        const player: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] === player) {
                    pieces.push(new Coord(x, y));
                }
            }
        }
        return pieces;
    }
}
