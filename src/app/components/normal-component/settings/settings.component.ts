import { Component, Signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Theme, ThemeService } from '../../../services/ThemeService';
import { UserSettingsService } from '../../../services/UserSettingsService';

type SettingOption<T> = { value: T; name: string }

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    imports: [ReactiveFormsModule],
})
export class SettingsComponent {

    private readonly userSettingsService: UserSettingsService = inject(UserSettingsService);
    private readonly themeService: ThemeService = inject(ThemeService);

    public readonly availableLanguages: SettingOption<string>[] = [
        { value: 'fr', name: 'Français' },
        { value: 'en', name: 'English' },
    ];
    public readonly availableThemes: SettingOption<Theme>[] = [
        { value: 'light', name: $localize`Light` },
        { value: 'dark', name: $localize`Dark` },
    ];
    public readonly currentTheme: Signal<Theme> = this.themeService.theme;
    public currentLanguage: string;

    public constructor() {
        this.currentLanguage = this.userSettingsService.getLanguage();
    }
    public changeLanguage(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        this.userSettingsService.changeLanguage(target.value);
        this.reload();
    }
    public changeTheme(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const selectedTheme: SettingOption<Theme> | undefined =
            this.availableThemes.find((theme: SettingOption<Theme>): boolean => theme.value === target.value);
        if (selectedTheme != null) {
            this.userSettingsService.changeTheme(selectedTheme.value);
            this.themeService.loadTheme(selectedTheme.value);
        }
    }
    private reload(): void {
        // Reload app to apply changes
        window.open(window.location.href, '_self');
    }
}
