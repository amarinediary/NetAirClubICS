$(() => {
    if (localStorage.getItem('local.aeroclub')) {
        $('#aeroclub').val(localStorage.getItem('local.aeroclub'));
    };

    if (localStorage.getItem('local.login')) {
        $('#login').val(localStorage.getItem('local.login'));
    };

    if (localStorage.getItem('local.password')) {
        $('#password').val(localStorage.getItem('local.password'));
    };

    let aeroclub = $('#aeroclub').val(),
        login = $('#login').val(),
        password = $('#password').val();

    if (aeroclub != '' && login != '' && password != '') {
        $("#submit").prop({
            'disabled': false,
            'readonly': false,
        }).removeClass('pe-none');
    } else {
        $("#submit").prop({
            'disabled': true,
            'readonly': true,
        }).addClass('pe-none');
    };

    if (login != '') {
        $('#login').removeClass('is-invalid').addClass('is-valid');
    } else {
        $('#login').removeClass('is-valid').addClass('is-invalid');
    };

    if (password != '') {
        $('#password').removeClass('is-invalid').addClass('is-valid');
    } else {
        $('#password').removeClass('is-valid').addClass('is-invalid');
    };

    $('#aeroclub, #login, #password').on('keyup keypress change focus', () => {
        aeroclub = $('#aeroclub').val(),
            login = $('#login').val(),
            password = $('#password').val();

        localStorage.setItem('local.aeroclub', $('#aeroclub').val());
        localStorage.setItem('local.login', $('#login').val());
        localStorage.setItem('local.password', $('#password').val());

        if (aeroclub != '' && login != '' && password != '') {
            $("#submit").prop({
                'disabled': false,
                'readonly': false,
            }).removeClass('pe-none');
        } else {
            $("#submit").prop({
                'disabled': true,
                'readonly': true,
            }).addClass('pe-none');
        };

        if (login != '') {
            $('#login').removeClass('is-invalid').addClass('is-valid');
        } else {
            $('#login').removeClass('is-valid').addClass('is-invalid');
        };

        if (password != '') {
            $('#password').removeClass('is-invalid').addClass('is-valid');
        } else {
            $('#password').removeClass('is-valid').addClass('is-invalid');
        };
    });

    $("#submit").click((event) => {
        event.preventDefault();

        aeroclub = $('#aeroclub').val(),
            login = $('#login').val(),
            password = $('#password').val();

        if (aeroclub != '' && login != '' && password != '') {

            $("#aeroclub, #login, #password, #days, #submit").prop({
                'disabled': true,
                'readonly': true,
            }).addClass('pe-none');

            $('#loader').removeClass('d-none');

            $('body').addClass('pe-none overflow-hidden');

            $.ajax({
                url: '/form',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    aeroclub: aeroclub,
                    login: login,
                    password: password,
                }),
                success: (response) => {
                    //console.log(response);
                    let stamp = Date.now();
                    if (response.status === 404) {
                        $('.toast-container').append(`<div id="toast-${stamp}" class="toast align-items-center text-white bg-danger border-0 mb-3 hide" style="max-width:100%;"><div class="d-flex"><div class="toast-body text-truncate">Vôtre <a href="${response.url}" target="_blank" rel="noopener">NetAirClub</a> ne répond pas, erreur ${response.status}.</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`);
                    } else if (response.url.includes('?lg=X')) {
                        $('.toast-container').append(`<div id="toast-${stamp}" class="toast align-items-center text-white bg-danger border-0 mb-3 hide" style="max-width:100%;"><div class="d-flex"><div class="toast-body text-truncate">Identifiants incorrects.</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`);
                    } else if (response.found == 0) {
                        $('.toast-container').append(`<div id="toast-${stamp}" class="toast align-items-center text-white bg-danger border-0 mb-3 hide" style="max-width:100%;"><div class="d-flex"><div class="toast-body text-truncate"><u>${response.found} réservations</u> trouvées.</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`);
                    } else {
                        $('.toast-container').append(`<div id="toast-${stamp}" class="toast align-items-center text-white bg-success border-0 mb-3 hide" style="max-width:100%;"><div class="d-flex"><div class="toast-body text-truncate"><u>${response.found} réservations</u> trouvées.</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`);

                        $('#results').removeClass('d-none');

                        $('#webcal-href').attr('href', response.webcal);
                        $('#webcal-input').val(response.webcal);
                        $('.events-counter').html(`${response.found}+`);
                    };

                    new bootstrap.Toast($(`#toast-${stamp}`)).show();

                    $("#aeroclub, #login, #password, #submit").prop({
                        'disabled': false,
                        'readonly': false,
                    }).removeClass('pe-none');

                    $('body').removeClass('pe-none overflow-hidden');

                    $('#loader').addClass('d-none');
                },
                error: (error) => {
                    console.log(error);
                    window.location.reload();
                },
            });
        };
    });
});
