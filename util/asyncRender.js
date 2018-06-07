//This module extends the Express response object with the asyncRender function

//The asyncRender function wraps the application's render function in a promise,
//making it async/await compatible.

module.exports = function(expressApp) {
    async function asyncRender (name, options={}) {
        return new Promise((resolve, reject) => {
            expressApp.render(name, options, (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
    }

    expressApp.response.asyncRender = asyncRender;
};
