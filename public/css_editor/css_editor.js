const MainEditor = window.opener;
var css_editor;

/**
 * @param errors --> lista degli errori
 * Stampa tutte le scritte di errore
 */
function errorsToString(errors) {
    var error_img = '<i class="fas fa-times-circle fa-sm text-danger"></i>';
    var error_string = "<div class='css-validation validation-error'>";
    for (let i = 0; i < errors.length; i++) {
        let tr_error = errors[i];
        if (tr_error.children[2].innerHTML.trim() == 'Parse Error') {
            return error_string + error_img + " Errore di parsing: non è stato individuato alcun foglio di stile. Per favore, controlla il CSS inserito.</div>";
        } else {
            error_string += error_img + " " + tr_error.children[0].innerHTML + " " + tr_error.children[2].children[0].innerHTML
            error_string += "<br>"
        }
    }
    return error_string + " </div>";
};


/**
 * @param warnings --> lista dei warnings
 * Stampa tutte le scritte di warning
 */
function warningsToString(warnings) {
    var warning_img = '<i class="fas fa-exclamation-triangle fa-sm text-warning"></i>';
    var warning_string = "<div class='css-validation'>";
    for (let i = 0; i < warnings.length; i++) {
        let tr_warnings = warnings[i];
        warning_string += warning_img + " " + tr_warnings.children[0].innerHTML + " " + tr_warnings.children[2].innerHTML;
        warning_string += "<br>"
    }
    return warning_string + "</div>";
};


/**
 * Mostra/nasconde la guida dell'editor
 */
function showGuide() {
    if ($("#guide").css("display") == "none") {
        $("#editorUI").fadeOut();
        $("#guide").fadeIn();
    }
    else {
        $("#guide").fadeOut();
        $("#editorUI").fadeIn();
    }
};


/**
 * Controlla il CSS collegandosi agli appositi validatori e fa il display di eventuali errori o warnings.
 */
function validate_css() {
    $("#cssvaluator").toggle(false);
    $("#loading").toggle(true);

    $.ajax({
        url: 'http://jigsaw.w3.org/css-validator/validator',
        method: 'GET',
        data: { profile: 'css3', warning: 0, output: 'html', text: css_editor.getValue() },
        success: function (data) {
            $("#loading").toggle(false);
            $("#cssvaluator").toggle(true);
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
                var congrats = "<div class='css-validation'><i class='fas fa-check-circle fa-sm text-success'></i> Non sono stati trovati errori.</div>"
                $('#csserror').html(congrats + "<br><br>" + warning_string);
            }
            else {
                let errors = parsed_css_validator.getElementsByClassName('error-section')[0].children[1].children[0].children;
                var error_string = errorsToString(errors);
                var warning_string = warningsToString(warnings)
                $('#csserror').html(error_string + warning_string);
            }
        },
        error: function (errorMessage) {
            $("#loading").toggle(false);
            $("#cssvaluator").toggle(true);
            console.log(errorMessage);
            $('#csserror').html("Si è verificato un errore, si prega di riprovare più tardi.")
        }
    })
};


/**
 * Salva il CSS scritto, inviandolo all'editor principale tramite canale apposito. Chiude la finestra al termine dell'operazione
 */
function saveCSS() {
    validate_css();

    MainEditor.postMessage({
        event_type: "save",
        content: {
            sheet: css_editor.getValue(),
            valid: !( $( "#csserror .validation-error" ).length )
        }
    }, "*");
    
    window.onbeforeunload = null;
    window.close();
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