$('document').ready(() => {
    setInterval(checkTxtMSSV, 100);
})
var mssvNew, mssvOld, daOld, daNew;

function checkTxtMSSV() {
	mssvOld = mssvNew;
    daOld = daNew;
    daNew = $('#sel1').val();
    mssvNew = $('input[name=mssv]').val();
    if (mssvOld != mssvNew || daNew != daOld) {
        if ($('input[name=mssv]').val() >= 20000000) {
            (async function() {
                $.ajax({
                    url: "./da/" + $('#sel1').val() + "/byid=" + $('input[name=mssv]').val(),
                    type: "GET",
                    success: function(data) {
                        if (data[0] != undefined) {
                            var timestart = data[0].timestart.substring(0, 10);
                            timeend = data[0].timeend.substring(0, 10);
                            $('input[name=ky]').val(data[0].ky);
                            $('input[name=diem]').val(data[0].diem);
                            $('input[name=timestart]').val(timestart);
                            $('input[name=timeend]').val(timeend);
                            $('input[name=huongdan]').val(data[0].huongdan);
                            $('input[name=ghichu]').val(data[0].ghichu);
                            $('input[name=star]').val(data[0].star);
                            $('input[name=tendetai]').val(data[0].tendetai);
                            $("input[name=btnChange]").prop('disabled', false);
                        } else {
                            $('input[name=ky]').val("");
                            $('input[name=diem]').val("");
                            $('input[name=timestart]').val("");
                            $('input[name=timeend]').val("");
                            $('input[name=huongdan]').val("");
                            $('input[name=ghichu]').val("");
                            $('input[name=star]').val("");
                            $('input[name=tendetai]').val("");
                            $("input[name=btnChange]").prop('disabled', true);
                        }
                    }
                });
            })();
        } else {
            $('input[name=ky]').val("");
            $('input[name=diem]').val("");
            $('input[name=timestart]').val("");
            $('input[name=timeend]').val("");
            $('input[name=huongdan]').val("");
            $('input[name=ghichu]').val("");
            $('input[name=star]').val("");
            $('input[name=tendetai]').val("");
            $("input[name=btnChange]").prop('disabled', true);
        }
    }
}