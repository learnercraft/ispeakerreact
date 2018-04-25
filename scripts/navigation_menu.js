/* function which display the hidden menu */
function displayMenu(id){
  alert('hi');
  if($('.'+id).css("display")=="none"){

    $("#toggleMenu").removeClass("toggleMenuBg").addClass("toggleMenuBgActive");
          alert('hi');

    $("#ox-container #ox-header .top").addClass("topMarginBottom");
    $('.'+id).css("display","block");
    if(id=="navSubMenu1"){
      $('#navSubMenu2').css("display","none");
    }
    else if(id=="navSubMenu2"){
      $('#navSubMenu1').css("display","none");
    }
  }
  else {
    $('#'+id).css("display","none");
    $("#toggleMenu").removeClass("toggleMenuBgActive").addClass("toggleMenuBg");
    $(".top").removeClass("topMarginBottom");
  }
  return true;
}