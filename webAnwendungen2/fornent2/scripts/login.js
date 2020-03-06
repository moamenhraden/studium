$(document).ready(function () {
    let form = $('#mainform');
    $.validator.setDefaults({
        highlight: function (element) {
            $(element).addClass('is-invalid')
        },
        unhighlight:function(element){
            $(element).removeClass('is-invalid')
        }
    })

    form.validate({
        rules: {
            email:'required',
            password:'required'
        },
        messages: {
            email:'<small class="text-danger"> geben Sie eine Email ein </small>',
            password:'<small class="text-danger"> geben Sie ein Password </small>'
        },
        submitHandler: function(form) {
           console.log('hallo hallo ');
           
          }
        
    })
})