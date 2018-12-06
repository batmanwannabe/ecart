$(function () {

    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', function () {
        if (!confirm('Confirm deletion'))
            return false;
    });

    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }
    $("#orderaddress").hide();
    $('#addressdropdown').on('change', function () {
        if (this.value == 'newaddress')
        {
            $("#orderaddress").show();
        } else
        {
            $("#orderaddress").hide();
        }
    });
    
    
    $("#ordercard").hide();
    $('#carddropdown').on('change', function () {
        if (this.value == 'newcard')
        {
            $("#ordercard").show();
        } else
        {
            $("#ordercard").hide();
        }
    });

});


