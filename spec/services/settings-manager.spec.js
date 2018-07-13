const proxyquire = require('proxyquire');
const jasmine = require('jasmine');

const mockPath = {};
const mockSetting = {};

mockSetting.find = function(query, callback) {
    callback(undefined, this.mockDatabaseSettings);
};

mockSetting.findOne = function(query, callback) {
    let setting = undefined

    this.mockDatabaseSettings.forEach((_setting) => {
        if (_setting.key === query.key) {
            setting = _setting;
        }
    });

    callback(undefined, setting);
};

mockSetting.create = function(setting, callback) {
    setting.save = function() {}
    this.mockDatabaseSettings.push(setting);
    callback(undefined, setting);
};

mockSetting.deleteMany = function(query, callback) {
    callback();
};

const SettingsManager = proxyquire('../../services/settings-manager', {
    'path': mockPath,
    '../models/setting': mockSetting
});

describe('Settings Manager', () => {
    let settingsManager;

    beforeEach(() => {
        settingsManager = new SettingsManager();

        //Reset the mock database
        mockSetting.mockDatabaseSettings = [{
            key: 'test key',
            value: 'test value',
            themeSetting: false,
            hidden: false,
            save: function() {}
        }];
    });

    it('should load the cache and expose settings', (done) => {
        let setting = settingsManager.getSiteSetting('test key');
        expect(setting).toBeUndefined(); //Since the setting cache hasn't been loaded

        settingsManager.loadSiteSettings().then(() => {
            setting = settingsManager.getSiteSetting('test key');
            expect(setting).toBe('test value');

            done();
        });
    });

    it('should set a site setting', (done) => {
        let setting;
        
        //Should set a setting in the database
        settingsManager.setSiteSetting('set key', 'set value');
        settingsManager.loadSiteSettings().then(() => {
            setting = settingsManager.getSiteSetting('set key');
            expect(setting).toBe('set value');
            
            //Since the setting has been created, it won't be created if we call it again
            const spy = spyOn(mockSetting, 'create');
            settingsManager.setSiteSetting('set key', 'set key again');
            expect(spy).not.toHaveBeenCalled();
            
            done();
        });
    });

    it('should clear theme settings from the database', (done) => {
        const spy = spyOn(mockSetting, 'deleteMany').and.callThrough();

        settingsManager.clearThemeSettings().then(() => {
            expect(spy).toHaveBeenCalled();

            done();
        });
    });

});