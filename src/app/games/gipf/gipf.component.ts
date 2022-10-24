import { Component } from '@angular/core';
import { GipfLegalityInformation, GipfRules } from 'src/app/games/gipf/GipfRules';
import { GipfMinimax } from 'src/app/games/gipf/GipfMinimax';
import { GipfFailure } from 'src/app/games/gipf/GipfFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexagonalGameComponent }
    from '../../components/game-components/game-component/HexagonalGameComponent';
import { GipfCapture, GipfMove, GipfPlacement } from 'src/app/games/gipf/GipfMove';
import { GipfState } from 'src/app/games/gipf/GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Arrow } from 'src/app/jscaip/Arrow';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GipfTutorial } from './GipfTutorial';
import { Utils } from 'src/app/utils/utils';

@Component({
    selector: 'app-gipf',
    templateUrl: './gipf.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class GipfComponent
    extends HexagonalGameComponent<GipfRules, GipfMove, GipfState, FourStatePiece, GipfLegalityInformation> {

    public inserted: MGPOptional<Arrow> = MGPOptional.empty();
    public arrows: Arrow[] = [];
    public captured: Coord[] = [];
    public moved: Coord[] = [];

    public HEXAGON_WIDTH: number = this.SPACE_SIZE;
    public SHARED_HEXAGON_X: number = Math.cos(30) * this.HEXAGON_WIDTH * 0.5;
    public BOARD_WIDTH: number = this.HEXAGON_WIDTH +
                                 (6 * (this.HEXAGON_WIDTH - this.SHARED_HEXAGON_X)) +
                                 (3 * this.STROKE_WIDTH / 2);
    public BOARD_HEIGHT: number = (7 * this.HEXAGON_WIDTH) + (4.5 * this.STROKE_WIDTH);
    private static readonly PHASE_INITIAL_CAPTURE: number = 0;
    private static readonly PHASE_PLACEMENT_COORD: number = 1;
    private static readonly PHASE_PLACEMENT_DIRECTION: number = 2;
    private static readonly PHASE_FINAL_CAPTURE: number = 3;
    private movePhase: number = GipfComponent.PHASE_PLACEMENT_COORD;

    // This state contains the board that is actually displayed
    private constructedState: GipfState;

    public possibleCaptures: ReadonlyArray<GipfCapture> = [];
    private initialCaptures: GipfCapture[] = [];
    private placement: MGPOptional<GipfPlacement> = MGPOptional.empty();
    private placementEntrance: MGPOptional<Coord> = MGPOptional.empty();
    private finalCaptures: GipfCapture[] = [];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
        this.rules = new GipfRules(GipfState);
        this.availableMinimaxes = [
            new GipfMinimax(this.rules, 'GipfMinimax'),
        ];
        this.encoder = GipfMove.encoder;
        this.tutorial = new GipfTutorial().tutorial;
        this.SPACE_SIZE = 40;
        this.constructedState = this.rules.node.gameState;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.50,
                                         new Coord((this.HEXAGON_WIDTH / 2) + (3 * this.STROKE_WIDTH/ 4),
                                                   - this.HEXAGON_WIDTH),
                                         FlatHexaOrientation.INSTANCE);
    }
    public updateBoard(): void {
        this.showLastMove();
        this.cancelMoveAttempt();
    }
    public showLastMove(): void {
        this.inserted = MGPOptional.empty();
        const lastMove: MGPOptional<GipfMove> = this.rules.node.move;
        if (lastMove.isPresent() && lastMove.get().placement.direction.isPresent()) {
            const lastPlacement: GipfPlacement = lastMove.get().placement;
            this.inserted = MGPOptional.of(this.arrowTowards(lastPlacement.coord, lastPlacement.direction.get()));
        }
        this.cancelMoveAttempt();
    }
    private arrowTowards(placement: Coord, direction: HexaDirection): Arrow {
        const previous: Coord = placement.getNext(direction.getOpposite());
        const center: Coord = this.getCenterAt(placement);
        const previousCenter: Coord = this.getCenterAt(previous);
        return new Arrow(previous, placement, previousCenter.x, previousCenter.y, center.x, center.y);
    }
    private markCapture(capture: GipfCapture): void {
        capture.forEach((c: Coord) => {
            this.captured.push(c);
        });
    }
    public getAllCoords(): Coord[] {
        return this.constructedState.allCoords();
    }
    public getPlayerSidePieces(player: Player): number[] {
        const nPieces: number = this.constructedState.getNumberOfPiecesToPlace(player);
        const pieces: number[] = [];
        for (let i: number = 0; i < nPieces; i += 1) {
            pieces.push(i);
        }
        return pieces;
    }
    public isPiece(coord: Coord): boolean {
        const piece: FourStatePiece = this.getPiece(coord);
        return piece !== FourStatePiece.EMPTY;
    }
    private getPiece(coord: Coord): FourStatePiece {
        const piece: FourStatePiece = this.constructedState.getPieceAt(coord);
        return piece;
    }
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        switch (this.movePhase) {
            case GipfComponent.PHASE_INITIAL_CAPTURE:
            case GipfComponent.PHASE_FINAL_CAPTURE:
                return this.selectCapture(coord);
            case GipfComponent.PHASE_PLACEMENT_COORD:
                return this.selectPlacementCoord(coord);
            default:
                Utils.expectToBe(this.movePhase, GipfComponent.PHASE_PLACEMENT_DIRECTION);
                return this.selectPlacementDirectionOrPlacementCoord(coord);
        }
    }
    private async selectCapture(coord: Coord): Promise<MGPValidation> {
        const captures: GipfCapture[] = [];
        this.possibleCaptures.forEach((candidate: GipfCapture) => {
            if (candidate.contains(coord)) {
                captures.push(candidate);
            }
        });
        if (captures.length > 1) {
            // Two captures contain this coordinate
            // We don't let the user choose it as it is ambiguous
            return this.cancelMove(GipfFailure.AMBIGUOUS_CAPTURE_COORD());
        } else if (captures.length === 0) {
            return this.cancelMove(GipfFailure.MISSING_CAPTURES());
        }
        const capture: GipfCapture = captures[0];

        // Capture validity is not checked because by construction the user can only select valid captures
        this.constructedState = GipfRules.applyCapture(capture, this.constructedState);
        this.markCapture(capture);
        this.possibleCaptures = GipfRules.getPossibleCaptures(this.constructedState);
        switch (this.movePhase) {
            case GipfComponent.PHASE_INITIAL_CAPTURE:
                this.initialCaptures.push(capture);
                if (this.possibleCaptures.length === 0) {
                    return this.moveToPlacementPhase();
                } else {
                    return MGPValidation.SUCCESS;
                }
            default:
                Utils.expectToBe(this.movePhase, GipfComponent.PHASE_FINAL_CAPTURE);
                this.finalCaptures.push(capture);
                if (this.possibleCaptures.length === 0) {
                    return this.tryMove(this.initialCaptures, this.placement.get(), this.finalCaptures);
                } else {
                    return MGPValidation.SUCCESS;
                }
        }
    }
    private moveToPlacementPhase(): MGPValidation {
        this.movePhase = GipfComponent.PHASE_PLACEMENT_COORD;
        return MGPValidation.SUCCESS;
    }
    private moveToInitialCaptureOrPlacementPhase(): MGPValidation {
        this.possibleCaptures = GipfRules.getPossibleCaptures(this.constructedState);
        if (this.possibleCaptures.length === 0) {
            this.movePhase = GipfComponent.PHASE_PLACEMENT_COORD;
        } else {
            this.movePhase = GipfComponent.PHASE_INITIAL_CAPTURE;
        }
        return MGPValidation.SUCCESS;
    }
    private async moveToFinalCapturePhaseOrTryMove(): Promise<MGPValidation> {
        this.possibleCaptures = GipfRules.getPossibleCaptures(this.constructedState);
        if (this.possibleCaptures.length === 0) {
            return this.tryMove(this.initialCaptures, this.placement.get(), this.finalCaptures);
        } else {
            this.movePhase = GipfComponent.PHASE_FINAL_CAPTURE;
        }
        return MGPValidation.SUCCESS;
    }
    private computeArrows(placement: Coord): void {
        this.arrows = [];
        for (const dir of GipfRules.getAllDirectionsForEntrance(this.constructedState, placement)) {
            if (GipfRules.isLineComplete(this.constructedState, placement, dir) === false) {
                const nextSpace: Coord = placement.getNext(dir);
                const center1: Coord = this.getCenterAt(placement);
                const center2: Coord = this.getCenterAt(nextSpace);
                this.arrows.push(new Arrow(placement, nextSpace, center1.x, center1.y, center2.x, center2.y));
            }
        }
    }
    private async selectPlacementCoord(coord: Coord): Promise<MGPValidation> {
        const validity: MGPValidation = this.rules.placementCoordValidity(this.constructedState, coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        if (this.placementEntrance.equalsValue(coord)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        this.placementEntrance = MGPOptional.of(coord);
        const clickedPiece: FourStatePiece = this.constructedState.getPieceAt(coord);
        if (clickedPiece === FourStatePiece.EMPTY) {
            // Because the coord of insertion is empty, there is no need for the user to choose a direction.
            return this.selectPlacementDirection(MGPOptional.empty());
        } else {
            this.movePhase = GipfComponent.PHASE_PLACEMENT_DIRECTION;
            this.computeArrows(coord);
            if (this.arrows.length === 0) {
                this.cancelMove(GipfFailure.NO_DIRECTIONS_AVAILABLE());
            }
        }
        return MGPValidation.SUCCESS;
    }
    private async selectPlacementDirection(dir: MGPOptional<HexaDirection>): Promise<MGPValidation> {
        this.placement = MGPOptional.of(new GipfPlacement(this.placementEntrance.get(), dir));
        const validity: MGPValidation = this.rules.placementValidity(this.constructedState, this.placement.get());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.arrows = [];
        this.constructedState = GipfRules.applyPlacement(this.placement.get(), this.constructedState);
        return this.moveToFinalCapturePhaseOrTryMove();
    }
    private async selectPlacementDirectionOrPlacementCoord(coord: Coord): Promise<MGPValidation> {
        const entrance: Coord = this.placementEntrance.get();
        if (entrance.isAlignedWith(coord) === false ||
            entrance.getDistance(coord) !== 1)
        {
            return this.selectPlacementCoord(coord);
        }
        const direction: MGPFallible<HexaDirection> = HexaDirection.factory.fromMove(entrance, coord);
        return this.selectPlacementDirection(direction.toOptional());
    }
    private async tryMove(initialCaptures: ReadonlyArray<GipfCapture>,
                          placement: GipfPlacement,
                          finalCaptures: ReadonlyArray<GipfCapture>): Promise<MGPValidation> {
        const move: GipfMove = new GipfMove(placement, initialCaptures, finalCaptures);
        const validity: MGPValidation = await this.chooseMove(move, this.rules.node.gameState, this.scores.get());
        return validity;
    }
    public cancelMoveAttempt(): void {
        this.constructedState = this.rules.node.gameState;
        this.captured = [];
        this.moved = [];

        const moveOptional: MGPOptional<GipfMove> = this.rules.node.move;
        if (moveOptional.isPresent()) {
            const move: GipfMove = moveOptional.get();
            const previousState: GipfState = this.rules.node.mother.get().gameState;
            move.initialCaptures.forEach((c: GipfCapture) => this.markCapture(c));
            move.finalCaptures.forEach((c: GipfCapture) => this.markCapture(c));
            this.moved = this.rules.getPiecesMoved(previousState, move.initialCaptures, move.placement);
        }

        this.initialCaptures = [];
        this.finalCaptures = [];
        this.placementEntrance = MGPOptional.empty();
        this.placement = MGPOptional.empty();

        this.arrows = [];

        this.moveToInitialCaptureOrPlacementPhase();
    }
    public getSpaceClass(coord: Coord): string {
        if (this.captured.some((c: Coord) => c.equals(coord))) {
            return 'captured';
        } else if (this.moved.some((c: Coord) => c.equals(coord))) {
            return 'moved-fill';
        } else {
            return '';
        }
    }
    public getPieceClass(coord: Coord): string {
        const piece: FourStatePiece = this.getPiece(coord);
        return this.getPlayerClass(Player.of(piece.value));
    }
    public getRemainingPieceCy(player: Player): number {
        const absoluteY: number = 25;
        if (player === Player.ONE) {
            return absoluteY;
        } else {
            return this.BOARD_HEIGHT - absoluteY;
        }
    }
    public getRemainingPieceCx(player: Player, p: number): number {
        const absoluteX: number = 20 + (p * this.SPACE_SIZE * 0.5);
        if (player === Player.ONE) {
            return absoluteX;
        } else {
            return this.BOARD_WIDTH - (15 + absoluteX);
        }
    }
}
