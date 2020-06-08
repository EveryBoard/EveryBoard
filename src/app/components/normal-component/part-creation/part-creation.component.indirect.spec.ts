import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { PartCreationComponent } from './part-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule, MatRadioModule, MatSliderModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { GameService } from 'src/app/services/game/GameService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { JoinerServiceMock } from 'src/app/services/joiner/JoinerServiceMock';
import { Component, ViewChild } from '@angular/core';

const gameServiceStub = {

    getActivesPartsObs: () => of([]),

    unSubFromActivesPartsObs: () => { },
};
const chatServiceStub = {
};
describe('PartCreationComponent Indirect', () => {

    let hostComponent: HostComponent;

    let hostFixture: ComponentFixture<HostComponent>;

    let joinerService: JoinerService;

    beforeAll(() => {
        PartCreationComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || PartCreationComponent.VERBOSE;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatStepperModule, MatRadioModule, MatSliderModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [HostComponent, PartCreationComponent],
            providers: [
                { provide: GameService, useValue: gameServiceStub },
                { provide: JoinerService, useClass: JoinerServiceMock },
                { provide: ChatService, useValue: chatServiceStub },
            ],
        }).compileComponents();

        hostFixture = TestBed.createComponent(HostComponent);
        hostComponent = hostFixture.componentInstance;
        joinerService = TestBed.get(JoinerService);

        JoinerServiceMock.emittedsJoiner = null;
        hostComponent.userName = null;
    }));
    it('should create', async(() => {
        JoinerServiceMock.emittedsJoiner = [];
        hostComponent.userName = "whoever";
        hostFixture.detectChanges();
        
        expect(hostComponent).toBeTruthy("Host component should have been created");
        expect(hostComponent.wrappedComponent).toBeTruthy("PartCreationComponent should have been created");
    }));
    afterEach(async(() => {
        hostComponent.wrappedComponent.ngOnDestroy();
    }));
    @Component({
        selector: `host-component`,
        template: `<app-part-creation [userName]="userName" partId="joinerId"></app-part-creation>`
    }) class HostComponent {

        public userName: string;

        @ViewChild(PartCreationComponent, { static: false })
        public wrappedComponent: PartCreationComponent
    }
});
