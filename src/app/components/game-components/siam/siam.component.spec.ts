import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { SiamComponent } from './siam.component';
import { SiamMove } from 'src/app/games/siam/siammove/SiamMove';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { Coord } from 'src/app/jscaip/coord/Coord';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Siam"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('SiamComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: SiamComponent;

    let clickElement: (element: DebugElement) => Promise<boolean> = async(element: DebugElement) => {
        if (element != null) {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        } else {
            return false;
        }
    };
    let insertAt: (coord: Coord) => Promise<boolean> = async(coord: Coord) => {
        let buttonName: string = '#insertAt_' + coord.x + '_' + coord.y;
        const insertAtElement: DebugElement = debugElement.query(By.css(buttonName));
        return clickElement(insertAtElement);
    };
    let chooseOrientation: (coord: Coord, orientation: string) => Promise<boolean> = async(coord: Coord, orientation: string) => {
        const buttonName: string = '#chooseOrientation_' + coord.x + '_' + coord.y + '_' + orientation;
        const chooseOrientationElement: DebugElement = debugElement.query(By.css(buttonName));
        return clickElement(chooseOrientationElement);
    };
    let clickPiece: (coord: Coord) => Promise<boolean> = async(coord: Coord) => {
        const buttonName: string = '#clickPiece_' + coord.x + '_' + coord.y;
        const clickPieceElement: DebugElement = debugElement.query(By.css(buttonName));
        return clickElement(clickPieceElement);
    };
    let chooseDirection: (coord: Coord, direction: string) => Promise<boolean> = async(coord: Coord, direction: string) => {
        const buttonName: string = '#chooseDirection_' + coord.x + '_' + coord.y + '_' + direction;
        const chooseDirectionElement: DebugElement = debugElement.query(By.css(buttonName));
        return clickElement(chooseDirectionElement);
    };
    let doMove: (move: SiamMove) => Promise<boolean> = async(move: SiamMove) => {
        if (move.isInsertion()) {
            if (await insertAt(move.coord)) {
                const inserted: Coord = move.coord.getNext(move.moveDirection.get());
                return chooseOrientation(inserted, move.landingOrientation.toString());
            }
        } else if (await clickPiece(move.coord)) {
            const direction: Orthogonal = move.moveDirection.getOrNull();
            const moveDirection: string = direction ? direction.toString() : '';
            if (await chooseDirection(move.coord, moveDirection)) {
                const futureCoord: Coord = direction ? move.coord.getNext(direction): move.coord;
                const landingOrientation: string = move.landingOrientation.toString();
                return chooseOrientation(futureCoord, landingOrientation);
            }
        }
        return false;
    }
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
        gameComponent = wrapper.gameComponent as SiamComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("SiamComponent should be created");
    });
    it('should accept insertion at first turn', fakeAsync(async() => {
        const move: SiamMove = new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        expect(await doMove(move)).toBeTrue();
    }));
    it('Should not allow to choose direction before choosing piece', async() => {
        let move: SiamMove = new SiamMove(5, 2, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();
        move = new SiamMove(2, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        expect(await doMove(move)).toBeTrue();

        expect(await chooseDirection(new Coord(4, 2), 'UP')).toBeFalse();
    });
    it('Should not allow to move empty case or ennemy pieces', async() => {
        let move: SiamMove = new SiamMove(-1, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
        expect(await doMove(move)).toBeTrue();

        expect(await clickPiece(new Coord(0, 0))).toBeFalse();
        spyOn(gameComponent, "message").and.callThrough();
        expect(await clickPiece(new Coord(0, 2))).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith("Can't choose ennemy's pieces");
    });
    it('should cancel move when trying to insert while having selected a piece', fakeAsync(async() => {
        let move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();
        move = new SiamMove(5, 0, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();

        // clickPiece shoud work
        spyOn(gameComponent, "clickPiece").and.callThrough();
        expect(await clickPiece(new Coord(4, 4))).toBeTrue();
        expect(gameComponent.clickPiece).toHaveBeenCalledTimes(1);
        expect(gameComponent.clickPiece).toHaveBeenCalledWith(4, 4);

        // then insertion should not
        spyOn(gameComponent, "message").and.callThrough();
        spyOn(gameComponent, "insertAt").and.callThrough();
        expect(await insertAt(new Coord(-1, 2))).toBeTrue();
        expect(gameComponent.insertAt).toHaveBeenCalledTimes(1);
        expect(gameComponent.insertAt).toHaveBeenCalledWith(-1, 2);
        expect(gameComponent.message).toHaveBeenCalledWith("Can't insert when there is already a selected piece");
    }));
    it('should allow rotation', fakeAsync(async() => {
        let move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();
        move = new SiamMove(5, 0, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();

        move = new SiamMove(4, 4, MGPOptional.empty(), Orthogonal.DOWN);
        expect(await doMove(move)).toBeTrue();
    }));
    it('should allow normal move', fakeAsync(async() => {
        let move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();
        move = new SiamMove(5, 0, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();

        move = new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();
    }));
    it('should decide outing orientation automatically', fakeAsync(async() => {
        let move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();
        move = new SiamMove(5, 0, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        expect(await doMove(move)).toBeTrue();

        expect(await clickPiece(new Coord(4, 4))).toBeTrue();
        spyOn(gameComponent, "tryMove").and.callThrough();
        expect(await chooseDirection(new Coord(4, 4), 'RIGHT')).toBeTrue();
        expect(gameComponent.tryMove).toHaveBeenCalledTimes(1);
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SiamMove, "decode").and.callThrough();
        gameComponent.decodeMove(269);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SiamMove, "encode").and.callThrough();
        gameComponent.encodeMove(new SiamMove(2, 2, MGPOptional.empty(), Orthogonal.UP));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
