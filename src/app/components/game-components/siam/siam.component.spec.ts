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
import { SiamMove, SiamMoveNature } from 'src/app/games/siam/siammove/SiamMove';

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
    it('should accept simple part', () => {
        const listMoves: SiamMove[] = [
            new SiamMove(-1, 4, SiamMoveNature.FORWARD), 
            new SiamMove(0, 5, SiamMoveNature.FORWARD),
            new SiamMove(0, 3, SiamMoveNature.CLOCKWISE)
        ];

        let legal: boolean;
        for (let move of listMoves) {
            console.log("let's try move " + move.toString());
            if (move.isInsertion()) {
                legal = gameComponent.insertAt(move.coord.x, move.coord.y);
            } else {
                legal = gameComponent.onBoardClick(move.coord.x, move.coord.y) && 
                        gameComponent.onMoveNatureSelection(move.nature.value);
            }
            expect(legal).toBeTruthy(move);
            if (!legal) break;
        };
    });
    it('should accept insertion at first turn', () => {
        expect(gameComponent.insertAt(2, 5)).toBeTruthy();
    });
});