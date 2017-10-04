$('document').ready(function() {
    $.ajax({
        url: "giangvien/bomon=KHMT",
        type: "GET",
        success: function(data) {
            data.forEach(function(ele, ind) {
                $('#giangvienSelect').append('<option value="' + ele.id + '">' + ele.ten + '</option>')
            })
        }
    })
    $('#bomonSelect').on('change', function() {
    	$('#giangvienSelect').empty();
        $.ajax({
            url: "giangvien/bomon=" + $('#bomonSelect').val(),
            type: "GET",
            success: function(data) {
                data.forEach(function(ele, ind) {
                    $('#giangvienSelect').append('<option value="' + ele.id + '">' + ele.ten + '</option>')
                })
            }
        })
    });
})