import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/authentication/AuthenticationService.spec';

import { OnlineGameCreationComponent } from './online-game-creation.component';

describe('OnlineGameCreationComponent', () => {
    let component: OnlineGameCreationComponent;
    let fixture: ComponentFixture<OnlineGameCreationComponent>;

    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = fixture.debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        }
    };
    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [
                MatSnackBarModule,
                RouterTestingModule,
            ],
            declarations: [
                OnlineGameCreationComponent,
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        fixture = TestBed.createComponent(OnlineGameCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create and redirect to chosen game', fakeAsync(async() => {
        component.pickGame('whateverGame');
        spyOn(component.router, 'navigate');
        expect(await clickElement('#playOnline')).toBeTrue();
        tick();
        expect(component.router.navigate).toHaveBeenCalledOnceWith(['/play/whateverGame', 'PartDAOMock0']);
    }));
});
