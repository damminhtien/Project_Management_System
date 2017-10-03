$('document').ready(function() {
    (async function() {
        $.ajax({
            url: "../da/da1/get8from/0",
            type: "GET",
            success: function(data) {
                for (var i = 0; i < 8; i++) {
                    $('#da1id' + i).html("Id : " + data[i].id);
                    $('#da1ten' + i).html("Tên đề tài : " + data[i].tendetai);
                    $('#da1tacgia' + i).html("Tác giả : " + data[i].uploadby);
                    $('#da1giangvien' + i).html("Giảng viên hướng dẫn : " + data[i].huongdan);
                    $('#da1thoigian' + i).html("Thời gian tải lên : " + data[i].timeupload);
                    $('#da1diem' + i).html("Điểm : " + data[i].diem);
                    $('#da1ghichu' + i).html("Ghi chú : " + data[i].ghichu);
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
                    $('#da2id' + i).html("Id : " + data[i].id);
                    $('#da2ten' + i).html("Tên đề tài : " + data[i].tendetai);
                    $('#da2tacgia' + i).html("Tác giả : " + data[i].uploadby);
                    $('#da2giangvien' + i).html("Giảng viên hướng dẫn : " + data[i].huongdan);
                    $('#da2thoigian' + i).html("Thời gian tải lên : " + data[i].timeupload);
                    $('#da2diem' + i).html("Điểm : " + data[i].diem);
                    $('#da2ghichu' + i).html("Ghi chú : " + data[i].ghichu);
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
                    $('#da3id' + i).html("Id : " + data[i].id);
                    $('#da3ten' + i).html("Tên đề tài : " + data[i].tendetai);
                    $('#da3tacgia' + i).html("Tác giả : " + data[i].uploadby);
                    $('#da3giangvien' + i).html("Giảng viên hướng dẫn : " + data[i].huongdan);
                    $('#da3thoigian' + i).html("Thời gian tải lên : " + data[i].timeupload);
                    $('#da3diem' + i).html("Điểm : " + data[i].diem);
                    $('#da3ghichu' + i).html("Ghi chú : " + data[i].ghichu);
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
                    $('#datnid' + i).html("Id : " + data[i].id);
                    $('#datnten' + i).html("Tên đề tài : " + data[i].tendetai);
                    $('#datntacgia' + i).html("Tác giả : " + data[i].uploadby);
                    $('#datngiangvien' + i).html("Giảng viên hướng dẫn : " + data[i].huongdan);
                    $('#datnthoigian' + i).html("Thời gian tải lên : " + data[i].timeupload);
                    $('#datndiem' + i).html("Điểm : " + data[i].diem);
                    $('#datnghichu' + i).html("Ghi chú : " + data[i].ghichu);
                }
            }
        });
    })();
});