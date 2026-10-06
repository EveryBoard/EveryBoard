/**
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';

// Retained until the application and its tests are migrated to zoneless change detection.
import 'zone.js';
