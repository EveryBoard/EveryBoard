import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { JoueursDAO } from 'src/app/dao/JoueursDAO';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoueursDAOMock } from 'src/app/dao/tests/JoueursDAOMock.spec';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
    let component: WelcomeComponent;
    let fixture: ComponentFixture<WelcomeComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [
                MatSnackBarModule,
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
            ],
            declarations: [WelcomeComponent],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(WelcomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
