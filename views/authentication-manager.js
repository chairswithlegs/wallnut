var authenticationManager = {
    login: function(username, password, redirect=undefined) {
        var body = {
            username: username,
            password: password
        }
        console.log(body);
        var req = new XMLHttpRequest();
        req.responseType = 'json'
        req.open('POSt', './login');
        req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        req.send(JSON.stringify(body));
        req.addEventListener('load', function() {
            if (req.status !== 200) {
                return;
            } else {
                document.cookie='jwt=Bearer ' + req.response.token;
            
                if (redirect) {
                    location.href=redirect;
                }
            }
        });
    },
    logout: function() {
        document.cookie = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    },
    isAuthenticated: function() {
        if (document.cookie.indexOf('jwt=Bearer') === -1) {
            return false;
        } else {
            return true;
        }
    }
}