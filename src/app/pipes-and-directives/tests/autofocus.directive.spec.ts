/* eslint-disable max-lines-per-function */
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { ConfigRoomDAOMock } from 'src/app/dao/tests/ConfigRoomDAOMock.spec';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { CurrentGameService } from 'src/app/services/CurrentGameService';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { GameService } from 'src/app/services/GameService';
import { ServerTimeService } from 'src/app/services/ServerTimeService';
import { ConfigRoomServiceMock } from 'src/app/services/tests/ConfigRoomServiceMock.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { CurrentGameServiceMock } from 'src/app/services/tests/CurrentGameService.spec';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { GameServiceMock } from 'src/app/services/tests/GameServiceMock.spec';
import { ServerTimeServiceMock } from 'src/app/services/tests/ServerTimeServiceMock.spec';
import { BlankComponent, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AutofocusDirective } from '../autofocus.directive';
import { FirestoreTimePipe } from '../firestore-time.pipe';
import { HumanDurationPipe } from '../human-duration.pipe';
import { ToggleVisibilityDirective } from '../toggle-visibility.directive';

@Component({
    template: `<input type="text" autofocus />`,
})
class AutofocusTestComponent {}

describe('AutofocusDirective', () => {
    let testUtils: SimpleComponentTestUtils<AutofocusTestComponent>;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [AutofocusTestComponent, AutofocusDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        testUtils = await SimpleComponentTestUtils.create(AutofocusTestComponent, undefined, false);
    }));

    it('should autofocus components decorated with the directive', fakeAsync(() => {
        // Given an element with the autofocus directive
        const element: HTMLElement = testUtils.findElementByDirective(AutofocusDirective).nativeElement;
        spyOn(element, 'focus').and.callThrough();

        // When the component is loaded
        testUtils.detectChanges();
        tick(1);

        // Then the element is focused
        expect(element.focus).toHaveBeenCalledTimes(1);
    }));
});
