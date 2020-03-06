
// TODO : zeit block nur für arzt email anzeigen 
// TODO : image block nur für arzt email anzeigen 
// TODO : bei load fragen nach der benutzer rolle 
// user : user => ohne image und zeit mit termine  [nochmal diskutieren] 
// user : arzt => mit image und zeit und termine für alle user  [nochmal diskutieren]
// TODO  : bei registrierung nach user rolle fragen 

$(document).ready(function () {
    checkUser()
    activateFormElements()
    save_btn = $('#mainform #btn-save')
    save_btn.click(function(){
        saveInfo()
    })
})


function checkUser(){
    
}



function activateFormElements(){
    let btnPersönlicheDaten = $('#mainform #btn-PD');
    let btnKontaktDaten = $('#mainform #btn-KD');
    let btnAdresse = $('#mainform #btn-A');
    btnPersönlicheDaten.click(function(){
        $('#mainform input[name=vorname]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
        $('#mainform input[name=nachname]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
        $('#mainform input[name=geburtstag]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
    })
    btnKontaktDaten.click(function(){
        $('#mainform input[name=email]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
        $('#mainform input[name=telefonnummer]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
    })

    btnAdresse.click(function(){
        $('#mainform input[name=strasse]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
        $('#mainform input[name=hausnummer]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
        $('#mainform input[name=plz]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly')
        $('#mainform input[name=ort]').addClass('form-control').removeClass('form-control-plaintext').removeAttr('readonly') 
    })
}


function saveInfo(){
    DisableFormElements()
    let vorname = $('#mainform input[name=vorname]').val()
    let nachname = $('#mainform input[name=nachname]').val()
    let geburtstag = $('#mainform input[name=geburtstag]').val()
    let email  = $('#mainform input[name=email]').val()
    let strasse = $('#mainform input[name=strasse]').val()
    let hausnummer = $('#mainform input[name=hausnummer]').val()
    let plz = $('#mainform input[name=plz]').val()
    let ort = $('#mainform input[name=ort]').val()
    console.log(vorname , nachname , geburtstag, email, strasse , hausnummer , plz , ort  );
    
}

function DisableFormElements(){
        $('#mainform input[name=vorname]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=nachname]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=geburtstag]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=email]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=telefonnummer]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=strasse]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=hausnummer]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=plz]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly')
        $('#mainform input[name=ort]').addClass('form-control-plaintext').removeClass('form-control').attr('readonly') 
}
