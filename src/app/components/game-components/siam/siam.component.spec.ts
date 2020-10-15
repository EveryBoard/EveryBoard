import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { SiamComponent } from './siam.component';
import { SiamMove } from 'src/app/games/siam/siammove/SiamMove';
import { Orthogonale } from 'src/app/jscaip/DIRECTION';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';

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

    let gameComponent: SiamComponent;

    let doMove: (move: SiamMove) => Promise<boolean> = async(move: SiamMove) => {
        if (move.isInsertion()) {
            return await gameComponent.insertAt(move.coord.x, move.coord.y) &&
                   await gameComponent.chooseOrientation(move.landingOrientation.toString());
        } else {
            const moveDirection: string = move.moveDirection.isAbsent() ? '' : move.moveDirection.get().toString();
            return gameComponent.onBoardClick(move.coord.x, move.coord.y) &&
                   await gameComponent.chooseDirection(moveDirection) && // TODO: take in account eventual "piece outing"
                   await gameComponent.chooseOrientation(move.landingOrientation.toString());
        }
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
        tick(1);
        gameComponent = wrapper.gameComponent as SiamComponent;
    }));

    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("SiamComponent should be created");
    });

    it('should accept simple part', async() => {
        const listMoves: SiamMove[] = [
            new SiamMove(-1, 4, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT),
            new SiamMove(0, 5, MGPOptional.of(Orthogonale.UP), Orthogonale.UP),
            new SiamMove(0, 3, MGPOptional.empty(), Orthogonale.DOWN),
            new SiamMove(0, 4, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.LEFT),
        ];

        let legal: boolean;
        for (let move of listMoves) {
            legal = await doMove(move);
            expect(legal).toBeTruthy(move);
            if (!legal) break;
        };
    });

    it('should accept insertion at first turn', async() => {
        expect(await gameComponent.insertAt(2, 5)).toBeTruthy();
    });

    it('should cancel move when trying to select direction or orientation before piece, or trying to move empty case', async() => {
        spyOn(gameComponent, "cancelMove").and.callThrough();
        expect(await gameComponent.chooseDirection('')).toBeFalsy("Should not allow to choose direction before choosing piece");
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(1);
        expect(gameComponent.onBoardClick(0, 0)).toBeFalsy("Should not allow to move empty case");
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(2);
    });

    it('should cancel move when calling tryMove without direction or choosen coord', async() => {
        spyOn(gameComponent, "cancelMove").and.callThrough();
        expect(await gameComponent.chooseOrientation('UP')).toBeFalsy("Should not allow to choose orientation before choosing piece");
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(1);
        expect(await gameComponent.tryMove()).toBeFalsy("Should not call tryMove before setting everything");
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(2);
    });

    it('should cancel move when trying to insert while having selected a piece', async() => {
        await doMove(new SiamMove(-1, 4, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT));
        gameComponent.onBoardClick(0, 4);
        spyOn(gameComponent, "cancelMove").and.callThrough();
        expect(await gameComponent.insertAt(-1, 2)).toBeFalsy();
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(1);
    });

    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SiamMove, "decode").and.callThrough();
        gameComponent.decodeMove(269);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });

    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SiamMove, "encode").and.callThrough();
        gameComponent.encodeMove(new SiamMove(2, 2, MGPOptional.empty(), Orthogonale.UP));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});