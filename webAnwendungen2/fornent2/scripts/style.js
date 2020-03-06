$(document).ready(function(){
    backgroundHeight();
    headerHeight();
    navbarScroll();
    registeroverlay();
});

  function backgroundHeight(){
    $('#background').height($(window).height());
  }

  function headerHeight(){
    var navHeight = $('#navbar').innerHeight(),
        winHeight = $(window).height();
    $('#header > .row').height(winHeight - navHeight);
  }

  function navbarScroll() {
    $(document).scroll(function () {
      var $nav = $("#navbar");
      $nav.toggleClass('backgroundScroll', $(this).scrollTop() > $nav.height());
      
    });
  }


  function registeroverlay(){
    $('#registeroverlay').height($(window).height());
  }