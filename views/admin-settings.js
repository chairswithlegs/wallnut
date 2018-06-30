document
.getElementById('form-submit-button')
.addEventListener('click', submitForm);

function submitForm() {
    var inputs = document.getElementsByTagName('input')
    var postBody = {};
    
    for(var i=0; i<inputs.length; i++) {
        postBody[inputs[i].dataset.settingKey] = inputs[i].value;
    }

    putForm(postBody);
}


function putForm(formData) {
    var req = new XMLHttpRequest();
    req.open('PUT', './settings');
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.send(JSON.stringify(formData));
    req.addEventListener('load', function() {
        submitAlert(req.status === 200);
    });
}

function submitAlert(success) {
    $('#success-alert').addClass('d-none');
    $('#error-alert').addClass('d-none');
    
    if (success) {
        $('#success-alert').removeClass('d-none');
    } else {
        $('#error-alert').removeClass('d-none');
    }

    setTimeout(() => {
        $('#success-alert').addClass('d-none');
        $('#error-alert').addClass('d-none');
    }, 3000);
}
