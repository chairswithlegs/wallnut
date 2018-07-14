const proxyquire = require('proxyquire');

const mockApp = {};
mockApp.render = function(view, options, callback) {
    callback(undefined, {
        viewPath: view,
        options: options
    });
};

const mockFs = {};
mockFs.readdir = function(path, callback) {
    if (path === 'theme-directory') {
        callback(undefined, ['blog.pug', 'post.pug']);
    } else if (path === 'theme-directory-no-views') {
        callback(undefined, []);
    } else {
        callback('Error...', undefined);
    }
};

const ViewRenderer = proxyquire('../../services/view-renderer', {
    'fs': mockFs,
});

describe('View Renderer', () => {
    let viewRenderer;

    beforeEach(() => {
        viewRenderer = new ViewRenderer(mockApp, 'pug');
    });

    it('should get/set the view injection', () => {
        viewRenderer.setViewInjection({ 'test key': 'test value' });
        expect(viewRenderer.getViewInjection()['test key']).toBe('test value');
    });

    it('should populate the view map', (done) => {
        viewRenderer.populateViewMap('theme-directory').then((success) => {
            expect(success).toBeTruthy();
            expect(viewRenderer.getViewPath('blog')).toBe('theme-directory/blog.pug');
            done();
        });
    });

    it('should clear the paths from the view map', (done) => {
        viewRenderer.populateViewMap('theme-directory').then(() => {
            expect(viewRenderer.getViewPath('blog')).toBeTruthy();
            viewRenderer.clearViewPaths();
            expect(viewRenderer.getViewPath('blog')).toBeFalsy();
            done();
        });
    });

    it('should render the view', (done) => {
        viewRenderer.populateViewMap('theme-directory').then(() => {
            viewRenderer.setViewInjection({ 'test injection key': 'test injection value' });
            viewRenderer.renderAsync('blog', { 'test options key': 'test options value'}).then((output) => {
                expect(output.options['test injection key']).toBe('test injection value');
                expect(output.options['test options key']).toBe('test options value');
                expect(output.viewPath).toBe('theme-directory/blog.pug');
                done();
            });
        });
    });
});