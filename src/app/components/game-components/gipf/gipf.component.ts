import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GipfLegalityStatus } from 'src/app/games/gipf/gipf-legality-status/GipfLegalityStatus';
import { GipfCapture, GipfMove, GipfPlacement } from 'src/app/games/gipf/gipf-move/GipfMove';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { GipfPiece } from 'src/app/games/gipf/gipf-piece/GipfPiece';
import { GipfRules, GipfFailure } from 'src/app/games/gipf/gipf-rules/GipfRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { HexaLayout } from 'src/app/jscaip/hexa/HexaLayout';
import { HexaOrientation } from 'src/app/jscaip/hexa/HexaOrientation';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

export class Arrow {
    public constructor(public readonly source: Coord,
                       public readonly destination: Coord,
                       public readonly x1: number,
                       public readonly y1: number,
                       public readonly x2: number,
                       public readonly y2: number) {}
}

export class GipfComponentFailure {
    public static AMBIGUOUS_CAPTURE_COORD: string =
        `Veuillez sélectionner une autre case de la capture que vous souhaitez prendre,
         celle-ci appartient à deux captures.`
    public static NOT_PART_OF_CAPTURE: string =
        `Veuillez sélectionner une capture.`;
    public static CLICK_FURTHER_THAN_ONE_COORD: string =
        `Veuillez sélectionner une destination à une distance de 1 de l'entrée.`;
    public static NO_DIRECTIONS_AVAILABLE: string =
        `Veuillez sélectionner une autre case, toutes les lignes pour ce placement sont complètes.`
}

@Component({
    selector: 'app-gipf',
    templateUrl: './gipf.component.html',
})
export class GipfComponent extends AbstractGameComponent<GipfMove, GipfPartSlice, GipfLegalityStatus> {
    private static PIECE_SIZE: number = 30;

    public rules: GipfRules = new GipfRules(GipfPartSlice);

    public scores: number[] = [0, 0];

    public arrows: Arrow[] = [];
    public captured: Coord[] = [];
    public moved: Coord[] = [];
    public currentlyMoved: Coord[] = [];

    public hexaLayout: HexaLayout =
        new HexaLayout(GipfComponent.PIECE_SIZE * 1.50, new Coord(300, 300), HexaOrientation.FLAT);

    private static PHASE_INITIAL_CAPTURE: number = 0;
    private static PHASE_PLACEMENT_COORD: number = 1;
    private static PHASE_PLACEMENT_DIRECTION: number = 2;
    private static PHASE_FINAL_CAPTURE: number = 3;
    private movePhase: number = GipfComponent.PHASE_PLACEMENT_COORD;

    // This slice contains the board that is actually displayed
    private constructedSlice: GipfPartSlice = null;

    public possibleCaptures: ReadonlyArray<GipfCapture> = [];
    private initialCaptures: GipfCapture[] = [];
    private placement: MGPOptional<GipfPlacement> = MGPOptional.empty();
    private placementEntrance: MGPOptional<Coord> = MGPOptional.empty();
    private finalCaptures: GipfCapture[] = [];

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.showScore = true;
        this.constructedSlice = this.rules.node.gamePartSlice;
    }
    public updateBoard(): void {
        const slice: GipfPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.cancelMoveAttempt();
        this.moveToInitialCaptureOrPlacementPhase();
    }
    private markCapture(capture: GipfCapture): void {
        capture.forEach((c: Coord) => {
            this.captured.push(c);
        });
    }
    public decodeMove(encodedMove: number): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
    public encodeMove(move: GipfMove): number {
        return GipfMove.encoder.encode(move);
    }
    public getAllCoords(): Coord[] {
        return this.constructedSlice.hexaBoard.allCoords();
    }
    public getPlayerSidePieces(player: number): number[] {
        const nPieces: number = this.constructedSlice.getNumberOfPiecesToPlace(Player.of(player));
        const pieces: number[] = [];
        for (let i: number = 0; i < nPieces; i += 1) {
            pieces.push(i);
        }
        return pieces;
    }
    public isPiece(coord: Coord): boolean {
        const piece: GipfPiece = this.getPiece(coord);
        return piece !== GipfPiece.EMPTY;
    }
    private getPiece(coord: Coord): GipfPiece {
        const piece: GipfPiece = this.constructedSlice.hexaBoard.getAt(coord);
        return piece;
    }
    public getCenter(coord: Coord): Coord {
        return this.hexaLayout.getCenter(coord);
    }
    public getHexaCoordinates(coord: Coord): string {
        let desc: string = '';
        const coords: ReadonlyArray<Coord> = this.hexaLayout.getHexaCoordinates(coord);
        for (const corner of coords) {
            desc += corner.x + ' ' + corner.y + ' ';
        }
        desc += coords[0].x + ' ' + coords[0].y;
        return desc;
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
            case GipfComponent.PHASE_PLACEMENT_DIRECTION:
                const entrance: Coord = this.placementEntrance.get();
                try {
                    if (entrance.getDistance(coord) !== 1) {
                        return this.cancelMove(GipfComponentFailure.CLICK_FURTHER_THAN_ONE_COORD);
                    }
                    const direction: Direction = Direction.fromMove(entrance, coord);
                    return this.selectPlacementDirection(MGPOptional.of(direction));
                } catch (error) {
                    return this.cancelMove(GipfFailure.INVALID_PLACEMENT_DIRECTION);
                }
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
            return this.cancelMove(GipfComponentFailure.AMBIGUOUS_CAPTURE_COORD);
        } else if (captures.length === 0) {
            return this.cancelMove(GipfComponentFailure.NOT_PART_OF_CAPTURE);
        }
        const capture: GipfCapture = captures[0];

        // Capture validity is not checked because by construction the user can only select valid captures
        this.constructedSlice = this.rules.applyCapture(this.constructedSlice, capture);
        this.markCapture(capture);
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedSlice);
        switch (this.movePhase) {
            case GipfComponent.PHASE_INITIAL_CAPTURE:
                this.initialCaptures.push(capture);
                if (this.possibleCaptures.length === 0) {
                    return this.moveToPlacementPhase();
                } else {
                    return MGPValidation.SUCCESS;
                }
            case GipfComponent.PHASE_FINAL_CAPTURE:
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
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedSlice);
        if (this.possibleCaptures.length === 0) {
            this.movePhase = GipfComponent.PHASE_PLACEMENT_COORD;
        } else {
            this.movePhase = GipfComponent.PHASE_INITIAL_CAPTURE;
        }
        return MGPValidation.SUCCESS;
    }
    private async moveToFinalCapturePhaseOrTryMove(): Promise<MGPValidation> {
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedSlice);
        if (this.possibleCaptures.length === 0) {
            return this.tryMove(this.initialCaptures, this.placement.get(), this.finalCaptures);
        } else {
            this.movePhase = GipfComponent.PHASE_FINAL_CAPTURE;
        }
        return MGPValidation.SUCCESS;
    }
    private computeArrows(placement: Coord): void {
        this.arrows = [];
        for (const dir of this.rules.getAllDirectionsForEntrance(this.constructedSlice, placement)) {
            if (this.rules.isLineComplete(this.constructedSlice, placement, dir) === false) {
                const nextCase: Coord = placement.getNext(dir);
                const center1: Coord = this.getCenter(placement);
                const center2: Coord = this.getCenter(nextCase);
                this.arrows.push(new Arrow(placement, nextCase, center1.x, center1.y, center2.x, center2.y));
            }
        }
    }
    private async selectPlacementCoord(coord: Coord): Promise<MGPValidation> {
        const validity: MGPValidation = this.rules.placementCoordValidity(this.constructedSlice, coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.placementEntrance = MGPOptional.of(coord);
        if (this.constructedSlice.hexaBoard.getAt(coord) === GipfPiece.EMPTY) {
            // Because the coord of insertion is empty, there is no need for the user to choose a direction.
            return this.selectPlacementDirection(MGPOptional.empty());
        } else {
            this.movePhase = GipfComponent.PHASE_PLACEMENT_DIRECTION;
            this.computeArrows(coord);
            if (this.arrows.length === 0) {
                this.cancelMove(GipfComponentFailure.NO_DIRECTIONS_AVAILABLE);
            }
        }
        return MGPValidation.SUCCESS;
    }
    private async selectPlacementDirection(dir: MGPOptional<Direction>): Promise<MGPValidation> {
        this.placement = MGPOptional.of(new GipfPlacement(this.placementEntrance.get(), dir));
        const validity: MGPValidation = this.rules.placementValidity(this.constructedSlice, this.placement.get());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.arrows = [];
        this.currentlyMoved = this.rules.getPiecesMoved(this.constructedSlice, [], this.placement.get());
        this.constructedSlice = this.rules.applyPlacement(this.constructedSlice, this.placement.get());
        return this.moveToFinalCapturePhaseOrTryMove();
    }
    private async tryMove(initialCaptures: ReadonlyArray<GipfCapture>,
                          placement: GipfPlacement,
                          finalCaptures: ReadonlyArray<GipfCapture>): Promise<MGPValidation> {
        const move: GipfMove = new GipfMove(placement, initialCaptures, finalCaptures);
        const validity: MGPValidation = await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        return validity;
    }
    public cancelMoveAttempt(): void {
        this.constructedSlice = this.rules.node.gamePartSlice;
        this.captured = [];
        this.moved = [];

        const move: GipfMove = this.rules.node.move;
        if (move != null) {
            const previousSlice: GipfPartSlice = this.rules.node.mother.gamePartSlice;
            move.initialCaptures.forEach((c: GipfCapture) => this.markCapture(c));
            move.finalCaptures.forEach((c: GipfCapture) => this.markCapture(c));
            this.moved = this.rules.getPiecesMoved(previousSlice, move.initialCaptures, move.placement);
        }

        this.initialCaptures = [];
        this.finalCaptures = [];
        this.placementEntrance = MGPOptional.empty();
        this.placement = MGPOptional.empty();

        this.currentlyMoved = [];
        this.arrows = [];


        this.moveToInitialCaptureOrPlacementPhase();
    }
    public getCaseStyle(coord: Coord): {[key: string]: string} {
        return {
            'stroke-width': '8px',
            'fill': this.getCaseFill(coord),
            'stroke': 'black',
        };
    }
    private getCaseFill(coord: Coord): string {
        if (this.captured.some((c: Coord) => c.equals(coord))) {
            return this.CAPTURED_FILL;
        } else if (this.moved.some((c: Coord) => c.equals(coord))) {
            return this.MOVED_FILL;
        } else {
            return this.NORMAL_FILL;
        }
    }
    public getPieceStyle(coord: Coord): {[key:string]: string} {
        const piece: GipfPiece = this.getPiece(coord);
        return this.getPlayerPieceStyle(piece.player.value);
    }
    public getPlayerPieceStyle(player: number): {[key:string]: string} {
        return {
            'fill': this.getPlayerColor(Player.of(player)),
            'stroke': 'black',
            'stroke-width': '8px',
        };
    }
    public getPieceSize(): number {
        return GipfComponent.PIECE_SIZE;
    }
}
