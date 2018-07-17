const proxyquire = require('proxyquire');

const mockFs = {};
mockFs.readFile = function(path, callback) {
    if (path === 'theme-directory/mock-theme-no-config/config.json') {
        callback({ code: 'ENOENT' }, undefined);
    } else if (path === 'theme-directory/mock-theme/config.json') {
        callback(undefined, JSON.stringify({ 'test setting': 'test value' }));
    }
};

mockFs.stat = function(path, callback) {
    if (path === 'theme-directory/mock-theme' || path === 'theme-directory/mock-theme-no-config') {
        let stats = {
            isDirectory: () => true
        };
        
        callback(undefined, stats);
    } else {
        callback({}, undefined);
    }
};

mockFs.readdir = function(path, callback) {
    callback(undefined, ['mock-theme', 'mock-theme-no-config']);
};

const ThemeManager = proxyquire('../../services/theme-manager', {
    'fs': mockFs,
});

describe('Theme Manager', () => {
    let themeManager;

    beforeEach(() => {
        themeManager = new ThemeManager('theme-directory');
    });

    it('should store the themes directory location', () => {
        expect(themeManager.themesDirectory).toBe('theme-directory');
    });

    it('should get and set the active theme', (done) => {
        let spy = spyOn(themeManager, 'emit');
        
        expect(themeManager.getActiveTheme()).toBeUndefined();

        //Setting/getting a theme with config
        themeManager.setActiveTheme('mock-theme').then(() => { 
            expect(themeManager.getActiveTheme()).toBe('mock-theme');
            expect(spy).toHaveBeenCalledWith('theme-loaded');

            //Setting/getting a theme without config
            themeManager.setActiveTheme('mock-theme-no-config').then(() => {
                expect(themeManager.getActiveTheme()).toBe('mock-theme-no-config');
                expect(spy).toHaveBeenCalledWith('new-theme-activated');
                done();
            });
        });
    });

    it('should get a theme setting', (done) => {
        themeManager.setActiveTheme('mock-theme').then(() => {
            const setting = themeManager.getActiveThemeSetting('test setting');
            expect(setting).toBe('test value');
            done();
        });
    });

    it('should get a list of the available themes', (done) => {
        themeManager.getThemeList().then((themes) => {
            expect(themes[0]).toBe('mock-theme');
            expect(themes[1]).toBe('mock-theme-no-config');
            done();
        });
    });

    it('should find out if a theme exists', (done) => {
        themeManager.themeExists('nonexistent-theme').then((exists) => {
            expect(exists).toBeFalsy();

            themeManager.themeExists('mock-theme').then((exists) => {
                expect(exists).toBeTruthy();
                done();
            });
        });
    });

    it('should get the active theme\'s directory', (done) => {
        themeManager.setActiveTheme('mock-theme').then(() => {
            const directory = themeManager.getActiveThemeDirectory();
            expect(directory).toBe('theme-directory/mock-theme');
            done();
        });
    });
});
