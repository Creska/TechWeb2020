const channel = new BroadcastChannel( "css_channel" );
var css_editor;

/**
 * @param errors --> lista degli errori
 * Stampa tutte le scritte di errore
 */
function errorsToString(errors) {
    var error_img = "<img src='../icons/error.png' width='15px' height='15px'/>"
    var error_string = "<div class='css-validation'>";
    for (let i = 0; i < errors.length; i++) {
        let tr_error = errors[i];
        error_string += error_img + tr_error.children[0].innerHTML + " " + tr_error.children[2].children[0].innerHTML
        error_string += "<br>"
    }
    return error_string + " </div>";
};


/**
 * @param warnings --> lista dei warnings
 * Stampa tutte le scritte di warning
 */
function warningsToString(warnings) {
    var warning_img = "<img src='../icons/warning.png' width='15px' height='15px'/>"
    var warning_string = "<div class='css-validation'>";
    for (let i = 0; i < warnings.length; i++) {
        let tr_warnings = warnings[i];
        warning_string += warning_img + tr_warnings.children[0].innerHTML + " " + tr_warnings.children[2].innerHTML;
        warning_string += "<br>"
    }
    return warning_string + "</div>";
};


/**
 * 
 */
function validate_css() {
    $("#button-loading").html('<div class="spinner-border text-light" role="status"></div>');

    $.ajax({
        url: 'http://jigsaw.w3.org/css-validator/validator',
        method: 'GET',
        data: { profile: 'css3', warning: 0, output: 'html', text: css_editor.getValue() },
        success: function (data) {
            //TODO handling how to show errors
            $('#button-loading').html("<button id='cssvaluator' onclick='validate_css()'>Validate CSS</button>");
            var parser = new DOMParser();
            let parsed_css_validator = parser.parseFromString(data, 'text/html');
            //first, checking for warnings, since a css document can be valid or not with or without them
            var warnings = parsed_css_validator.getElementsByClassName('warning-section');
            var warning_string = "";
            if (warnings.length) {
                warnings = warnings[0].children[1].children[0].children;
                warning_string = warningsToString(warnings);
            }
            if (parsed_css_validator.getElementById('congrats')) {
                var congrats = "<div class='css-validation'><img src='../icons/check.png' width='15px' height='15px'/>Non sono stati trovati errori.</div>"
                $('#csserror').html(congrats + "<br><br>" + warning_string);
                //TODO saving the CSS
            }
            else {
                let errors = parsed_css_validator.getElementsByClassName('error-section')[0].children[1].children[0].children;
                var error_string = errorsToString(errors);
                var warning_string = warningsToString(warnings)
                $('#csserror').html(error_string + warning_string);
            }
        },
        error: function (errorMessage) {
            $('#button-loading').html("<button id='cssvaluator' onclick='validate_css()'>Validate CSS</button>")
            console.log(errorMessage);
            $('#csserror').html("Si è verificato un errore, si prega di riprovare più tardi.")
        }
    })
};

var test_stylesheet = `@charset "UTF-8";

@import url("booya.css") print, screen;
@import "whatup.css" screen;
@import "wicked.css";

/*Error*/
@charset "UTF-8";


@namespace "http://www.w3.org/1999/xhtml";
@namespace svg "http://www.w3.org/2000/svg";

/*Warning: empty ruleset */
.foo {
}

h1 {
font-weight: bold;
}

/*Warning: qualified heading */
.foo h1 {
font-weight: bold;
}

/*Warning: adjoining classes */
.foo.bar {
zoom: 1;
}

li.inline {
width: 100%;  /*Warning: 100% can be problematic*/
}

li.last {
display: inline;
padding-left: 3px !important;
padding-right: 3px;
border-right: 0px;
}

@media print {
li.inline {
  color: black;
}
}

@page {
margin: 10%;
counter-increment: page;

@top-center {
font-family: sans-serif;
font-weight: bold;
font-size: 2em;
content: counter(page);
}
}
`;