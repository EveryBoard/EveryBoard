import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { of } from "rxjs";

import { AppModule } from "src/app/app.module";
import { NumberTable } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";
import { JoueursDAO } from "src/app/dao/joueurs/JoueursDAO";
import { JoueursDAOMock } from "src/app/dao/joueurs/JoueursDAOMock";
import { EpaminondasMove } from "src/app/games/epaminondas/epaminondasmove/EpaminondasMove";
import { EpaminondasPartSlice } from "src/app/games/epaminondas/epaminondaspartslice/EpaminondasPartSlice";
import { EpaminondasNode } from "src/app/games/epaminondas/epaminondasrules/EpaminondasRules";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Direction } from "src/app/jscaip/DIRECTION";
import { Player } from "src/app/jscaip/Player";
import { AuthenticationService } from "src/app/services/authentication/AuthenticationService";
import { LocalGameWrapperComponent } from "../local-game-wrapper/local-game-wrapper.component";
import { EpaminondasComponent } from "./epaminondas.component";

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Epaminondas"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('EpaminondasComponent:', () => {

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: EpaminondasComponent;

    let clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true; // TODO: would be nice to return wether or not cancelMove has been called for illegal/invalid move reason
        }
    };
    let doMove: (move: EpaminondasMove, chooseMoveSpy: jasmine.Spy) => Promise<jasmine.Spy> =
        async(move: EpaminondasMove, chooseMoveSpy: jasmine.Spy) =>
    { // TODO: remove those in each file, inspire yourself of spec "Should show previously captured pieces, moved pieces, and their starting coords (when no move is ongoing)"
        chooseMoveSpy.calls.reset();
        const firstPiece: string = "#click_" + move.coord.x + "_" + move.coord.y;
        const movedPieces: number = move.movedPieces;
        expect(await clickElement(firstPiece)).toBeTrue();
        if (move.movedPieces > 1) {
            const lastSoldier: Coord = move.coord.getNext(move.direction, movedPieces - 1);
            const lastPiece: string = "#click_" + lastSoldier.x + "_" + lastSoldier.y;
            expect(await clickElement(lastPiece)).toBeTrue();
        }
        const landing: Coord = move.coord.getNext(move.direction, movedPieces + move.stepSize - 1);
        const lastClick: string = "#click_" + landing.x + "_" + landing.y;
        const oldSlice: EpaminondasPartSlice = gameComponent.rules.node.gamePartSlice;
        expect(await clickElement(lastClick)).toBeTrue();
        expect(chooseMoveSpy).toHaveBeenCalledWith(move, oldSlice, null, null);
        return chooseMoveSpy;
    };
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        debugElement = fixture.debugElement;
        tick(1);
        gameComponent = wrapper.gameComponent as EpaminondasComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("EpaminondasComponent should be created");
    });
    it('Should not accept ennemy click as a move first click', fakeAsync(async() => {
        spyOn(gameComponent, "message");
        expect(await clickElement("#click_0_0")).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith("Cette pièce appartient à l'ennemi, vous devez sélectionner une de vos pièces.");
    }));
    it('Should cancelMove when clicking on empty case at first', fakeAsync(async() => {
        spyOn(gameComponent, "message");
        expect(await clickElement("#click_5_5")).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith("Cette case est vide, vous devez sélectionner une de vos pièces.");
    }));
    it('Should select all soldier between first selected and new click', fakeAsync(async() => {
        spyOn(gameComponent, "message");
        expect(await clickElement("#click_0_10")).toBeTrue();
        expect(await clickElement("#click_2_10")).toBeTrue();
        expect(gameComponent.message).not.toHaveBeenCalled();
    }));
    it('Should cancel move when selecting non-contiguous soldier line', fakeAsync(async() => {
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, "chooseMove").and.callThrough();
        await doMove(new EpaminondasMove(0, 11, 2, 2, Direction.UP_RIGHT), chooseMoveSpy);
        await doMove(new EpaminondasMove(0, 0, 2, 2, Direction.DOWN), chooseMoveSpy);

        expect(await clickElement("#click_3_10")).toBeTrue();
        spyOn(gameComponent, "message");
        expect(await clickElement("#click_3_8")).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith("Phalanx cannot contain empty cases.");
    }));
    it('Should cancel move when clicking on non aligned pice', fakeAsync(async() => {
        expect(await clickElement("#click_0_11")).toBeTrue();
        spyOn(gameComponent, "message");
        expect(await clickElement("#click_2_10")).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith("Cette case n'est pas alignée avec la pièce sélectionnée.");
    }));
    it('Should change first soldier coord when last click was a phalanx extension in the opposite direction of the phalanx', fakeAsync(async() => {
        expect(await clickElement("#click_1_10")).toBeTrue();
        expect(await clickElement("#click_2_10")).toBeTrue();
        expect(gameComponent.firstPiece).toEqual(new Coord(1, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(2, 10));

        expect(await clickElement("#click_0_10")).toBeTrue();

        expect(gameComponent.firstPiece).toEqual(new Coord(2, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(0, 10));
    }));
    it('Should change last soldier coord when last click was a phalanx extension in the phalanx direction', fakeAsync(async() => {
        expect(await clickElement("#click_0_10")).toBeTrue();
        expect(await clickElement("#click_1_10")).toBeTrue();
        expect(gameComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(1, 10));

        expect(await clickElement("#click_2_10")).toBeTrue();

        expect(gameComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(2, 10));
    }));
    it('Should move firstPiece one step when clicking next to it without lastPiece selected', fakeAsync(async() => {
        expect(await clickElement("#click_0_10")).toBeTrue();
        spyOn(gameComponent, "chooseMove");
        const oldSlice: EpaminondasPartSlice = gameComponent.rules.node.gamePartSlice;
        expect(await clickElement("#click_0_9")).toBeTrue();
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        expect(gameComponent.chooseMove).toHaveBeenCalledWith(move, oldSlice, null, null);
    }));
    it('Should show last move when no move is ongoing (captures, left case, moved phallange)', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);

        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 1, Direction.UP);
        const validity: MGPValidation = await gameComponent.tryMove(move);
        expect(validity.isSuccess()).toBeTrue();

        expect(gameComponent.getRectFill(0, 7)).toBe(gameComponent.CAPTURED_FILL);
        expect(gameComponent.getRectFill(0, 8)).toBe(gameComponent.CAPTURED_FILL);
        expect(gameComponent.getRectFill(0, 11)).toBe(gameComponent.MOVED_FILL);
        expect(gameComponent.getRectFill(0, 10)).toBe(gameComponent.MOVED_FILL);
        expect(gameComponent.getRectFill(0, 9)).toBe(gameComponent.MOVED_FILL);
    }));
    it('Should show possible next click (after first click)', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);

        expect(await clickElement("#click_0_11")).toBeTrue();

        expect(gameComponent.getRectStyle(0, 10)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 9)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 11)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 10)).toBe(gameComponent.CLICKABLE_STYLE);
    }));
    it('Should deselect first piece when clicked (and no last piece exist)', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);

        expect(await clickElement("#click_0_11")).toBeTrue();
        expect(await clickElement("#click_0_11")).toBeTrue();

        expect(gameComponent.getRectStyle(0, 11)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 10)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 9)).toBe(gameComponent.CLICKABLE_STYLE);
    }));
    it('Should change first piece coord when clicked and last piece is neighboors', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        expect(await clickElement("#click_0_11")).toBeTrue(); // select first piece
        expect(await clickElement("#click_0_10")).toBeTrue(); // select last piece neighboor

        expect(await clickElement("#click_0_11")).toBeTrue(); // deselect first piece
        expect(gameComponent.firstPiece).toBe(new Coord(0, 10));
        expect(gameComponent.lastPiece).toBe(new Coord(-15, -1));
        expect(gameComponent.getRectStyle(0, 9)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 11)).toBe(gameComponent.CLICKABLE_STYLE);
    }));
    it('Should change first piece coord when clicked and last piece exist but is not neighboors', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        expect(await clickElement("#click_0_11")).toBeTrue(); // select first piece
        expect(await clickElement("#click_0_9")).toBeTrue(); // select last piece neighboor

        expect(await clickElement("#click_0_11")).toBeTrue(); // deselect first piece

        expect(gameComponent.firstPiece).toBe(new Coord(0, 10));
        expect(gameComponent.lastPiece).toBe(new Coord(0, 9));
        expect(gameComponent.getRectStyle(0, 7)).not.toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 8)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 11)).toBe(gameComponent.CLICKABLE_STYLE);
    }));
    it("Should show valid phalanx extension (both way)", fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        expect(await clickElement("#click_1_11")).toBeTrue(); // select first piece
        expect(await clickElement("#click_2_11")).toBeTrue(); // select last piece neighboor

        expect(gameComponent.getRectStyle(0, 11)).not.toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(3, 11)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(4, 11)).toBe(gameComponent.CLICKABLE_STYLE);
    }));
    it("Should show valid phalanx landing (both way)", fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, O, O, O, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        expect(await clickElement("#click_2_10")).toBeTrue();
        expect(await clickElement("#click_4_10")).toBeTrue();

        expect(gameComponent.getRectStyle(0, 10)).not.toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 10)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(5, 10)).toBe(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(6, 10)).not.toBe(gameComponent.CLICKABLE_STYLE);
    }));
});