$('document').ready(function() {
    setInterval(checkTxt, 100);
});

function checkTxt() {
    if ($("input[name=txtSdt]").val() != "" && $("input[name=txtMail]").val() != ""){
    	if ($("input[name=txtId]").val() < 20000000) {
            if ($("input[name=txtDiachi]").val() != "") {
                $("input[name=btnChange]").prop('disabled', false);
            }
        } else $("input[name=btnChange]").prop('disabled', false);
    }
}