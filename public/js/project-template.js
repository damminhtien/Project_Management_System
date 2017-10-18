$('document').ready(function() {
    (async function() {
        $.ajax({
            url: "../da/da1/get8from/0",
            type: "GET",
            success: function(data) {
                for (var i = 0; i < 8; i++) {
                    $('#da1ten' + i).html(data[i].tendetai);
                    $('#da1tacgia' + i).html(data[i].uploadby);
                    $('#da1diem' + i).html( data[i].diem);
                }
            }
        });
    })();
    (async function() {
        $.ajax({
            url: "../da/da2/get8from/0",
            type: "GET",
            success: function(data) {
                for (var i = 0; i < 8; i++) {
                    $('#da2ten' + i).html(data[i].tendetai);
                    $('#da2tacgia' + i).html(data[i].uploadby);
                    $('#da2diem' + i).html(data[i].diem);
                }
            }
        });
    })();
    (async function() {
        $.ajax({
            url: "../da/da3/get8from/0",
            type: "GET",
            success: function(data) {
                for (var i = 0; i < 8; i++) {
                    $('#da3ten' + i).html(data[i].tendetai);
                    $('#da3tacgia' + i).html(data[i].uploadby);
                    $('#da3diem' + i).html(data[i].diem);
                }
            }
        });
    })();
    (async function() {
        $.ajax({
            url: "../da/datn/get8from/0",
            type: "GET",
            success: function(data) {
                for (var i = 0; i < 8; i++) {
                    $('#datnten' + i).html(data[i].tendetai);
                    $('#datntacgia' + i).html(data[i].uploadby);
                    $('#datndiem' + i).html( data[i].diem);
                }
            }
        });
    })();
});