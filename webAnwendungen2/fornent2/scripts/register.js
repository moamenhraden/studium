

$(document).ready(function () {
    validate_submit_Form();
    
})


async function addUser(mydata){
        const   urlLand = 'http://localhost:8000/api/land/',
            urlAdresse = 'http://localhost:8000/api/adresse/',
            urlPerson = 'http://localhost:8000/api/person/',
            urlbenutzer = 'http://localhost:8000/api/benutzer';

    let landObj = mydata[0],
        adresseObj = mydata[1],
        personObj=mydata[2];
    console.log(personObj);
            
     try{
         let landdaten = (await $.post(urlLand, landObj)).daten;
         console.log(landdaten);
         let land={"id":landdaten.id};
         adresseObj["land"] = land;
       
         let adressedaten = (await $.post(urlAdresse, adresseObj)).daten;
         let adresse = {"id":adressedaten.id}
         personObj["adresse"]=adresse;
         console.log(personObj);
         let persondaten = (await $.post(urlPerson, personObj)).daten;
         console.log(persondaten);       
    
     }catch(e){
         console.log(e.statusText);
        
     }    
}





function validate_submit_Form(){
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
            vorname: 'required',
            nachname: 'required',
            password: {
                required: true,
                minlength: 2
            },
            password2: {
                required: true,
                equalTo: '#password01'
            },
            email: {
                required: true,
                email: true
            },
            strasse: 'required',
            hausnummer: 'required',
            plz: 'required',
            ort: 'required',
            land: 'required'
        },
        messages: {
            vorname:  '<small class="text-danger"> das ist falsch</small>',
            nachname: '<small class="text-danger"> das ist falsch</small>',
            email:{
                required:'<small class="text-danger"> du musst eingeben  </small>',
                email:'<small class="text-danger"> falsch </small>'
            },
            password:{
                required:'<small class="text-danger"> das ist falsch</small>',
                minlength:'<small class="text-danger"> kurz </small>'
            },
            password2:'<small class="text-danger"> kein übereinstimmung </small>',
            strasse: '<small class="text-danger"> das ist falsch</small>',
            hausnummer: '<small class="text-danger"> das ist falsch</small>',
            ort: '<small class="text-danger"> das ist falsch</small>',
            plz: '<small class="text-danger"> das ist falsch</small>',
            land: '<small class="text-danger"> das ist falsch</small>',
        },
        submitHandler: function(form,event ) {
            event.preventDefault();
            let mydata = formData();
            addUser(mydata);
            
           }
    })
}



function formData(){
    let vorname = $('#mainform  input[name=vorname]').val();
    let nachname = $('#mainform  input[name=nachname]').val();
    let telefonnummer =  $('#mainform  input[name=telefonnummer]').val();
    let land = $('#mainform  select[name=land]').val();
    let ort = $('#mainform  input[name=ort]').val();
    let plz = $('#mainform  input[name=plz]').val();
    let strasse = $('#mainform  input[name=strasse]').val();
    let hausnummer = $('#mainform  input[name=hausnummer]').val();
    let email = $('#mainform  input[name=email]').val();
    let password = $('#mainform  input[name=password]').val();
    let geburtstag = $('#mainform  input[name=date]').val();
    let anrede =  $('#mainform  input[name=anrede]:checked').val();
    
    let jahr = geburtstag.substring(0,4),
        monat = geburtstag.substring(5,7),
        tag = geburtstag.substring(8);
        geburtstag = tag+'.'+monat+'.'+jahr;
    console.log(vorname, nachname , land , ort ,plz , strasse , hausnummer , email , password , geburtstag , telefonnummer , anrede);
    
    let erg = [];
    
    let landObj = {
        "kennzeichnung":land.substring(0,2),
        "bezeichnung" : land
    }
    erg.push(landObj)
    

    let adresseObj = {
        "strasse": strasse,
        "hausnummer": hausnummer,
        "adresszusatz": "",
        "plz": plz,
        "ort": ort
    }

    erg.push(adresseObj)
    

    let personObj= {
        "anrede":anrede,
        "vorname":vorname,
        "nachname":nachname,
        "telefonnummer":telefonnummer,
        "email":email,
        "geburtstag":geburtstag
    }

    erg.push(personObj)
    
    return erg;
}

