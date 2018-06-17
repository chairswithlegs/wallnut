document
.getElementById('form-submit-button')
.addEventListener('click', submitForm);

function submitForm() {
    var formData = {
        title: $('#form-title').val(),
        content: $('#form-content').val(),
        id: $('#form-id').val()
    }

    //If we have no ID, then this is treated as a new post.
    if (formData.id === "") {
        postForm(formData);
    } else {
        putForm(formData);
    }
}

function putForm(formData) {
    var req = new XMLHttpRequest();
    req.open('PUT', './' + formData.id);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.send(JSON.stringify(formData));
    req.addEventListener('load', function() {
        submitAlert(req.status === 200);
    });
}

function postForm(formData) {
    var req = new XMLHttpRequest();
    req.open('POST', './' + formData.id);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.send(JSON.stringify(formData));
    req.addEventListener('load', function() {
        if (req.status === 200)
        submitAlert(true);
        $('#form-id').val(JSON.parse(req.response)._id);
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
