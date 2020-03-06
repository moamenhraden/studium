// global variables : 
let bool = false ; 


// ajax : 


$(document).ready(async function () {
    await dataToHomepage();
    await dataToHomepageCards();
    await getAllDoctorsToPage();
    if(bool == true ){
        $('#kenan').html('hallo')
    }
        
    let formHomepage = $('#formHomepage');
    formHomepage.on( 'submit', function(e){

        
        
        e.preventDefault();
        getDataFormHomepage();
    })

    let form = $('#searchform');
     form.submit(function (e) {
         e.preventDefault();
         getDataFormSearch();
         function2();
     })

    let registrationform = $('#registration');
    registrationform.submit(function(e){
        e.preventDefault();
        registerform();
    })
    
    

})

// get data ================================================================================================== 

async function searchById(id) {
    var url = 'http://localhost:8000/api/person/gib/';
    url = url + id;
    try {
        var data = (await ajaxGet(url)).daten;


        return data;
    } catch (e) {
        console.log(e.statusText);
    }
}



async function search(vorname = undefined, nachname = undefined,ort = undefined,
            land = undefined, fach = undefined) {
    var result = [];
    
    try {
        let data = await searchAlle();
        data.forEach(function (element) {

            
            if (element.vorname.toLowerCase() == vorname.toLowerCase()) {
                result.push(element)
            } else if (element.nachname.toLowerCase() == nachname.toLowerCase()) {
                result.push(element)
            } else if (element.adresse.ort.toLowerCase() == ort.toLowerCase()) {
                result.push(element)
            } 

        });
        return result;


    } catch (e) {
        
        console.log(e.statusText);
    }

}


async function searchAlle(){
    var url = 'http://localhost:8000/api/person/alle';
    var alle = (await ajaxGet(url)).daten;
    return alle ;
}


// Home page ================================================================================================== 

async function loaddata(max, size) {
    let objs = [],
        ids = randomNum(max, size);
    for (let index = 0; index < ids.length; index++) {
        var obj = await searchById(ids[index]);
        objs.push(obj)
    }
    return objs
}





async function dataToHomepage() {
    let array = await loaddata(4, 3);
    let all_h1 = $('#mainDoctors  h1');
    let all_ul = $('#mainDoctors ul');
    console.log(all_h1);

    let i = 0;
    all_h1.each(function (index) {
        $(this).html(
            array[i].vorname + ' ' + array[i++].nachname);
    })

    let j = 0;
    all_ul.each(function (index) {
        let html = objTohtml(array[j++])
        $(this).html(html);
    })
}

async function dataToHomepageCards() {
    let array = await loaddata(4, 3);
    let all_cards = $('#mainPart3 .card');
    console.log(all_cards);
    let i = 0;
    all_cards.each(function (card) {
        let html = objToCard(array[i++]);
        $(this).html(html);
    });

}



async function getDataFormHomepage() {
    
    let vorname = $('#formHomepage input[name=vorname]').val();
    let nachname = $('#formHomepage input[name=nachname]').val();
    let ort = $('#formHomepage input[name=ort]').val();
    bool = true ;    
    window.location.href = 'results.html';
    
    //let result = await search(vorname, nachname, ort , '  ', '  ');
    // console.log('=======result=========');
    // console.log(result);
    // xy = result;
    // console.log(xy);
    
    // console.log('hallo');
    
    
    

    //  if(result.length !=0 ){
    //      for (let index = 0; index < result.length; index++) {
    //          let element = result[index];
    //          let html = resultSearch_objToHtml(element);
    //          resultsSection.append(html);
    //          console.log(element);
            
           
    //      }
    // }

}


function function2(){

    console.log('halldfaölksdjf');
    
    
    // console.log('hallo');
    // console.log(xy);
    
    // let resultsSection = $('#resultsSection');
    // console.log(resultsSection);
    
    // resultsSection.html('');
    //   if(result.length !=0 ){
    //       for (let index = 0; index < result.length; index++) {
    //           let element = result[index];
    //           let html = resultSearch_objToHtml(element);
    //           resultsSection.append(html);
    //           console.log(element);
            
           
    //       }
    //  }
}


//search page ============================================


async function getAllDoctorsToPage(){
    var data = await searchAlle();
    let resultsSection = $('#resultsSection');
    for (let index = 0; index < data.length; index++) {
        let element = data[index];
        let html = resultSearch_objToHtml(element);
        resultsSection.append(html);
    }
}


 async function getDataFormSearch() {
     let vorname = $('#searchform  input[name=vorname]').val();
     let nachname = $('#searchform  input[name=nachname]').val();
     let land = $('#searchform  input[name=land]').val();
     let ort = $('#searchform  input[name=ort]').val();
     let fach = $('#searchform  input[name=fach]').val();

     let result = await search(vorname, nachname, ort, land, fach);

     let resultsSection = $('#resultsSection');
     console.log('the r.s.');
     
     console.log(resultsSection);
     
     resultsSection.html('');

      if(result.length !=0 ){
          for (let index = 0; index < result.length; index++) {
              let element = result[index];
              let html = resultSearch_objToHtml(element);
              resultsSection.append(html);
              console.log(element);
             
            
          }
     }

 }
 

//register page ============================================

function registerform(){
    
    $('#registration intput').each(function(e){
        console.log(e);
    })
    let vorname = $('#registration  input[name=vorname]').val();
    let nachname = $('#registration  input[name=nachname]').val();
    let email = $('#registration  input[name=email]').val();
    let password = $('#registration  input[name=password]').val();
    let password2 = $('#registration  input[name=password2]').val();
    let geburtstag = $('#registration  input[name=geburtstag]').val();
    let land = $('#registration  input[name=land]').val();
    let ort = $('#registration  input[name=ort]').val();
    let vorwahl = $('#registration  input[name=vorwahl]').val();
    let telefonnummer = $('#registration  input[name=telefonnummer]').val();
    let CompleteNummer = vorwahl + telefonnummer.slice(1) ;
    let geschlecht = $('#registration  input[type=radio]:checked').val();
    console.log(vorname , nachname , email , password,land ,geburtstag,  ort , CompleteNummer , geschlecht);
    
    }



// helper function =========================================

function ajaxGet(url) {
    let data;
    return $.ajax({
        type: "GET",
        url: url
    });
}

function randomNum(max, size) {
    var erg = [];
    for (var i = 0; i < size; i++) {
        num = Math.floor((Math.random() * max) + 1)
        if (($.inArray(num, erg)) === -1) {
            erg.push(num)
        } else {
            size++;
        }
    }
    return erg;
}


function objTohtml(obj) {
    let html = ' ';
    html += '<li> ' + obj.telefonnummer + ' </li>';
    html += '<li>' + obj.email + ' </li>';
    html += '<li>' + obj.adresse.strasse +
        obj.adresse.hausnummer + ' </li>';
    html += '<li>' + obj.adresse.plz +
        obj.adresse.ort + ' </li>';
    return html
}

function objToCard(obj) {
    let html = '<img src="images/doctor3.webp" class="card-img-top" alt="doctor image">' +
        '<div class="card-body">' +
        '<h5 class="card-title">' + obj.vorname + ' ' + obj.nachname + '</h5>' +
        '<p class="card-text">' + obj.adresse.ort + '</p>' +
        '</div>'
    return html;
}


 function resultSearch_objToHtml(obj){
     let html = '<div class="row  my-5  py-3 shadow-lg ">'+
                     '<div class="col-md-4 ">'+
                         '<img src="../images/doctor3.webp" alt="" >'+
                     '</div>'+
                     '<div class="col-md-8 ">'+
                         '<h1>'+
                         obj.vorname + ' '+ obj.nachname + 
                         '</h1>'+
                         '<ul>'+
                             '<li>'+
                                 '<i class="mx-2 fa fa-phone"></i>'+ '    '+
                                  obj.telefonnummer+
                             '</li>'+
                             '<li>'+
                                 '<i class="mx-2 fas fa-envelope"></i>'+'    '+
                                 obj.email +
                             '</li>'+
                             '<li>'+
                                 '<i class="mx-2 fas fa-map-marked-alt"></i>'+'    '+
                                 
                                      obj.adresse.strasse + ' '+ obj.adresse.hausnummer + ',   '+ 
                                      obj.adresse.plz + ' '+ obj.adresse.ort+    
                                           
                             '</li>'+
                             '<li>'+
                                 '<i class="mx-2 fas fa-flag"></i>'+'    '+
                                 obj.adresse.land.bezeichnung+
                             '</li>'+
                         '</ul>'+
                     '</div>'+
                 '</div>'
     return html
 }



