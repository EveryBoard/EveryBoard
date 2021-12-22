import { DOCUMENT } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WelcomeComponent } from 'src/app/components/normal-component/welcome/welcome.component';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ThemeService } from '../ThemeService';

describe('ThemeService', () => {
    let service: ThemeService;
    let testUtils: SimpleComponentTestUtils<WelcomeComponent>;

    function getThemeElement(): HTMLLinkElement {
        // We have to use DOCUMENT here, because the component fixture is not enough: it does not contain the head tag
        return TestBed.inject(DOCUMENT).getElementById('theme') as HTMLLinkElement;
    }

    async function prepare(): Promise<void> {
        testUtils = await SimpleComponentTestUtils.create(WelcomeComponent);
        service = TestBed.inject(ThemeService);
    }

    describe('without stored theme nor preferred color scheme', () => {
        beforeEach(fakeAsync(async() => {
            await prepare();
        }));

        it('should load default theme at construction', fakeAsync(async() => {
            // when the page loads
            testUtils.detectChanges();
            await testUtils.whenStable();
            tick(1000);
            // then the CSS is set to an existing theme
            expect(getThemeElement().href).toMatch('/light.css$');
        }));
        it('should change the theme when loadTheme is called', () => {
            // given a loaded page
            testUtils.detectChanges();
            // when a new theme is loaded
            service.loadTheme('dark');
            // then the CSS has been changed
            expect(getThemeElement().href).toMatch('/dark.css$');
            expect(service.getTheme()).toBe('dark');
        });
    });
    it('should use the stored theme if there is one', fakeAsync(async() => {
        // given that the dark theme is the stored setting
        spyOn(localStorage, 'getItem').and.returnValue('dark');
        // when the page is loaded
        await prepare();
        testUtils.detectChanges();
        // then the dark theme has been loaded
        expect(getThemeElement().href).toMatch('/dark.css$');
    }));
    it('should fall back to default if the stored theme is invalid', fakeAsync(async() => {
        const realMatchMedia: (query: string) => MediaQueryList = window.matchMedia;
        spyOn(localStorage, 'getItem').and.returnValue('invalid-theme');
        // given that the stored theme is invalid and there is no preferred color scheme
        spyOn(window, 'matchMedia').and.callFake(function(query: string): MediaQueryList {
            const result: MediaQueryList = realMatchMedia(query);
            return { ...result, matches: false };
        });
        // when the page is loaded
        await prepare();
        testUtils.detectChanges();
        // then the (default) dark theme has been loaded
        expect(getThemeElement().href).toMatch('/dark.css$');
    }));
    it('should use the preferred color scheme if there is one and no theme has been chosen', fakeAsync(async() => {
        const realMatchMedia: (query: string) => MediaQueryList = window.matchMedia;
        // given that the preferred color scheme is dark
        spyOn(window, 'matchMedia').and.callFake(function(query: string): MediaQueryList {
            const result: MediaQueryList = realMatchMedia(query);
            return { ...result, matches: query === '(prefers-color-scheme: dark)' };

        });
        // when the page is loaded
        await prepare();
        testUtils.detectChanges();
        // then the dark theme has been loaded
        expect(getThemeElement().href).toMatch('/dark.css$');
    }));
    it('should use the dark theme if there is no other preference', fakeAsync(async() => {
        const realMatchMedia: (query: string) => MediaQueryList = window.matchMedia;
        // given that there is no preferred color scheme
        spyOn(window, 'matchMedia').and.callFake(function(query: string): MediaQueryList {
            const result: MediaQueryList = realMatchMedia(query);
            return { ...result, matches: false };
        });
        // when the page is loaded
        await prepare();
        testUtils.detectChanges();
        // then the dark theme has been loaded
        expect(getThemeElement().href).toMatch('/dark.css$');
    }));
});
