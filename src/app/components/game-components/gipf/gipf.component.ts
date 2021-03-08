import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GipfLegalityStatus } from 'src/app/games/gipf/gipf-legality-status/GipfLegalityStatus';
import { GipfCapture, GipfMove, GipfPlacement } from 'src/app/games/gipf/gipf-move/GipfMove';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { GipfPiece } from 'src/app/games/gipf/gipf-piece/GipfPiece';
import { GipfRules } from 'src/app/games/gipf/gipf-rules/GipfRules';
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

@Component({
    selector: 'app-gipf',
    templateUrl: './gipf.component.html',
})
export class GipfComponent extends AbstractGameComponent<GipfMove, GipfPartSlice, GipfLegalityStatus> {
    private static PIECE_SIZE: number = 30;

    public rules: GipfRules = new GipfRules(GipfPartSlice);

    public scores: number[] = [0, 0];

    public readonly boardIndices: number[] = [-3, -2, -1, 0, 1, 2, 3];

    public arrows: Arrow[] = [];
    public captured: Coord[] = [];
    public moved: Coord[] = [];
    public currentlyCaptured: Coord[] = [];
    public currentlyMoved: Coord[] = [];

    public hexaLayout: HexaLayout =
        new HexaLayout(GipfComponent.PIECE_SIZE * 1.50, new Coord(300, 300), HexaOrientation.FLAT);

    public static PHASE_INITIAL_CAPTURE: number = 0;
    public static PHASE_PLACEMENT_COORD: number = 1;
    public static PHASE_PLACEMENT_DIRECTION: number = 2;
    public static PHASE_FINAL_CAPTURE: number = 3;
    public movePhase: number = GipfComponent.PHASE_PLACEMENT_COORD;

    // This slice contains the board that is actually displayed
    public constructedSlice: GipfPartSlice = null;

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
    public getPlayerSidePieces(player: number): number[] {
        const nPieces: number = this.constructedSlice.getNumberOfPiecesToPlace(Player.of(player));
        const pieces: number[] = [];
        for (let i: number = 0; i < nPieces; i += 1) {
            pieces.push(i);
        }
        return pieces;
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
    public updateBoard(): void {
        const slice: GipfPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.constructedSlice = slice;
        this.moveToInitialCaptureOrPlacementPhase();
    }
    public decodeMove(encodedMove: number): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
    public encodeMove(move: GipfMove): number {
        return GipfMove.encoder.encode(move);
    }
    public isOnBoard(x: number, y: number): boolean {
        return this.constructedSlice.hexaBoard.isOnBoard(new Coord(x, y));
    }
    private getPiece(x: number, y: number): GipfPiece {
        const piece: GipfPiece = this.constructedSlice.hexaBoard.getAt(new Coord(x, y));
        return piece;
    }
    public isPiece(x: number, y: number): boolean {
        if (this.constructedSlice.hexaBoard.isOnBoard(new Coord(x, y))) {
            const piece: GipfPiece = this.getPiece(x, y);
            return piece !== GipfPiece.EMPTY;
        } else {
            return false;
        }
    }
    public getCenter(x: number, y: number): Coord {
        return this.hexaLayout.getCenter(new Coord(x, y));
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
    public getHexaCoordinatesForXY(x: number, y: number): string {
        return this.getHexaCoordinates(new Coord(x, y));
    }
    private markCaptured(capture: GipfCapture): void {
        capture.forEach((c: Coord) => {
            this.currentlyCaptured.push(c);
        });
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
            return this.cancelMove(
                `Cette case fait partie de deux captures possibles, veuillez en choisir une autre`);
        } else if (captures.length === 0) {
            return this.cancelMove(`Cette case ne fait partie d'aucune capture`);
        }
        const capture: GipfCapture = captures[0];

        const validity: MGPValidation = this.rules.captureValidity(this.constructedSlice, capture);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.markCaptured(capture);
        this.constructedSlice = this.rules.applyCapture(this.constructedSlice, capture);
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedSlice);
        if (this.possibleCaptures.length === 0) {
            switch (this.movePhase) {
                case GipfComponent.PHASE_INITIAL_CAPTURE:
                    this.initialCaptures.push(capture);
                    return this.moveToPlacementPhase();
                case GipfComponent.PHASE_FINAL_CAPTURE:
                    this.finalCaptures.push(capture);
                    return this.tryMove(this.initialCaptures, this.placement.get(), this.finalCaptures);
                default:
                    throw new Error('Invalid move phase');
            }
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    private moveToPlacementPhase(): MGPValidation {
        this.arrows = [];
        this.movePhase = GipfComponent.PHASE_PLACEMENT_COORD;
        this.placementEntrance = MGPOptional.empty();
        this.placement = MGPOptional.empty();
        return MGPValidation.SUCCESS;
    }
    private moveToInitialCaptureOrPlacementPhase(): MGPValidation {
        this.arrows = [];
        this.initialCaptures = [];
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedSlice);
        if (this.possibleCaptures.length === 0) {
            this.movePhase = GipfComponent.PHASE_PLACEMENT_COORD;
        } else {
            this.movePhase = GipfComponent.PHASE_INITIAL_CAPTURE;
        }
        return MGPValidation.SUCCESS;
    }
    private async moveToFinalCapturePhaseOrTryMove(): Promise<MGPValidation> {
        this.arrows = [];
        this.finalCaptures = [];
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
            const nextCase: Coord = placement.getNext(dir);
            const center1: Coord = this.getCenter(placement.x, placement.y);
            const center2: Coord = this.getCenter(nextCase.x, nextCase.y);
            this.arrows.push(new Arrow(placement, nextCase, center1.x, center1.y, center2.x, center2.y));
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
        }
        return MGPValidation.SUCCESS;
    }
    private async selectPlacementDirection(dir: MGPOptional<Direction>): Promise<MGPValidation> {
        this.placement = MGPOptional.of(new GipfPlacement(this.placementEntrance.get(), dir));
        const validity: MGPValidation = this.rules.placementValidity(this.constructedSlice, this.placement.get());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.currentlyMoved = this.rules.getPiecesMoved(this.constructedSlice, this.placement.get());
        this.constructedSlice = this.rules.applyPlacement(this.constructedSlice, this.placement.get());
        return this.moveToFinalCapturePhaseOrTryMove();
    }
    private async tryMove(initialCaptures: ReadonlyArray<GipfCapture>,
                          placement: GipfPlacement,
                          finalCaptures: ReadonlyArray<GipfCapture>): Promise<MGPValidation> {
        try {
            const move: GipfMove = new GipfMove(placement, initialCaptures, finalCaptures);
            const validity: MGPValidation = await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
            if (validity.isSuccess()) {
                this.captured = this.currentlyCaptured;
                this.currentlyCaptured = [];
                this.moved = this.currentlyMoved;
                this.currentlyMoved = [];
            }
            return validity;
        } catch (error) {
            return this.cancelMove(error.message);
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        switch (this.movePhase) {
            case GipfComponent.PHASE_INITIAL_CAPTURE:
            case GipfComponent.PHASE_FINAL_CAPTURE:
                return this.selectCapture(new Coord(x, y));
            case GipfComponent.PHASE_PLACEMENT_COORD:
                return this.selectPlacementCoord(new Coord(x, y));
            case GipfComponent.PHASE_PLACEMENT_DIRECTION:
                const entrance: Coord = this.placementEntrance.get();
                try {
                    const dest: Coord = new Coord(x, y);
                    if (entrance.getDistance(dest) !== 1) {
                        return this.cancelMove(`Veuillez sélectionner une destination à une distance de 1 de l'entrée`);
                    }
                    const direction: Direction = Direction.fromMove(entrance, new Coord(x, y));
                    return this.selectPlacementDirection(MGPOptional.of(direction));
                } catch (error) {
                    return this.cancelMove(error.message);
                }
            default:
                return this.cancelMove('Vous ne pouvez pas sélectionner de pièce pour le moment');
        }
    }
    public isInCapture(coord: Coord): boolean {
        for (const capture of this.possibleCaptures) {
            if (capture.contains(coord)) {
                return true;
            }
        }
        return false;
    }
    public indicatesPossibleDirection(coord: Coord): boolean {
        const entrance: Coord = this.placementEntrance.get();
        for (const dir of this.rules.getAllDirectionsForEntrance(this.constructedSlice, entrance)) {
            // TODO: should check that line is not complete
            if (entrance.getNext(dir).equals(coord)) {
                return true;
            }
        }
        return false;
    }
    public readonly NORMAL_STYLE: {[key: string]: string} = {
        'stroke-width': '8px',
        'fill': 'lightgrey',
        'stroke': 'black',
    };
    public readonly MOVED_STYLE: {[key: string]: string} = {
        'stroke-width': '8px',
        'fill': 'grey',
        'stroke': 'black',
    };
    public readonly CAPTURED_STYLE: {[key: string]: string} = {
        'stroke-width': '8px',
        'fill': 'red',
        'stroke': 'black',
    };
    public readonly CLICKABLE_HIGHLIGHT_STYLE: {[key: string]: string} = {
        'stroke-width': '8px',
        'stroke': 'yellow',
        'fill': 'none',
    }
    public readonly NO_HIGHLIGHT_STYLE: {[key: string]: string} = {
        'fill': 'none',
        'stroke-width': '0px',
    }
    public getCaseStyle(x: number, y: number): {[key: string]: string} {
        const coord: Coord = new Coord(x, y);
        if (this.captured.some((c: Coord) => c.equals(coord))) {
            return this.CAPTURED_STYLE;
        } else if (this.moved.some((c: Coord) => c.equals(coord))) {
            return this.MOVED_STYLE;
        } else {
            return this.NORMAL_STYLE;
        }
    }
    public getPieceStyle(x: number, y: number): {[key:string]: string} {
        const piece: GipfPiece = this.getPiece(x, y);
        return this.getPlayerPieceStyle(piece.player.value);
    }
    public cancelMoveAttempt(): void {
        this.moveToInitialCaptureOrPlacementPhase();
    }
}
