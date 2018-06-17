document
.getElementById('form-submit-button')
.addEventListener('click', submitForm);

function submitForm() {
    var formData = {
        title: document.getElementById('form-title').value,
        content: document.getElementById('form-content').value,
        id: document.getElementById('form-id').value
    }
    
    var req = new XMLHttpRequest();
    req.open('PUT', './' + formData.id);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.send(JSON.stringify({ test: 'test' }));
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
}