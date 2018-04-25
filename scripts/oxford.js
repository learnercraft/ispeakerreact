function initEntry(basePath) {   // used ?
	// init double-click functionality
	setupDoubleClick(basePath, null, false, 'main-container', null, null, null);
	
	// init balloon tooltip
	initBalloon(basePath);
}

// Gareths code
$(function() {

  // ACCORDION
  $('.accordion dt').toggleClass('hide');
  $('.accordion dt:first-child').toggleClass('hide');

  // $('.accordion dd').hide();
  // $('.accordion dd:first-of-type').show();


  // add event listener so clicking on h2 will toggle the hide class in the li
  $( ".accordion dt" ).on( "click", function() {
    $(this).siblings( 'dt' ).addClass('hide');
    $(this).removeClass('hide');
    
    // $(this).next().slideDown().siblings( 'dd' ).slideUp();
  });

  // OPEN CLOSE
  // add event listener so clicking on h2 will toggle the hide class in the li
  $('.open-close dt').toggleClass('hide')
  $( ".open-close dt" ).on( "click", function() {
    $(this).toggleClass('hide');
  });

  // MOBILE NAV OPEN CLOSE
    $( ".menu_button" ).on( "click", function() {
      $(".main_nav").toggleClass('open-nav');
      return false;
    });

  //SEE MORE
  $( "a.see-more" ).on( "click", function() {
    var $this = $(this);
    $this.prev().toggleClass('show');
    if ( $this.html() == 'See more') { $this.html('See less');} 
      else   { $this.html('See more');}
    return false;
  });

  // GOTO TOP
  // mobile button to take you back to top of page
  $('.go-to-top').click(function () {
    $('html,body').animate({ scrollTop: 0 }, 500);
    return false;
  });

  // prac pron code

  $('.pron_row').on("click", function(){
    $('.pron_row').removeClass('active');
      $(this).addClass('active');
      return false;
  })


  $('.btn.record').on("click", function(){
    // $(this).removeClass('button_is_active');

    $(this).toggleClass('stop');

    if (! $(this).hasClass( "stop" )) { $(this).next().removeClass('inactive')}
      else
        {$(this).next().addClass('inactive')}
    // $(this).next().show();
    // $(this).next().next().show().removeClass('button_is_active');
    // $(this).next().next().next().hide();

  })
  $('.btn.play').on("click", function(){
    $(this).toggleClass('stop');

    if ($(this).hasClass( "stop" )) { $(this).prev().addClass('inactive')}
      else
    {$(this).prev().removeClass('inactive')}
  })
  // $('.pron_record_stop').on("click", function(){
  //   $(this).hide();
  //   $(this).prev().show();
  //   $(this).next().addClass('button_is_active');
  // })
  // $('.pron_button_play').on("click", function(){
  //   $(this).hide();
  //   $(this).next().show();
  // })
  // $('.pron_play_stop').on("click", function(){
  //   $(this).hide();
  //   $(this).prev().show();
  // })

// topic-dictionarty

  $('.nested_list span').click(function(e) {
    $(e.target).parent().toggleClass('is_collapsed');
    $(e.target).parent('.is_collapsed').find('li').addClass('is_collapsed');

    //need to close all open sub lists

  })

  $('.go-entry a').click(function(e) {
    // $('.top-level').toggleClass('is_collapsed');
    $('.go-entry a').removeClass('is-active');
    // $(this).addClass('is-active');
    $(this).parent().toggleClass('is-revealed');
    return false;
  })
  // tabs
  var activateTab = function(e){
    e.addClass("is-active").siblings().removeClass("is-active");
  };

  $(".mdl-tab").on('click', function(){
    var tabActive = $(this);
    var mdlTabData = $(this).data("mdl-tab");
    activateTab(tabActive);
    console.log(".mdl-tab-content[data-mdl-tab='" + mdlTabData + "']")
    $(".mdl-tab-content[data-mdl-tab='" + mdlTabData + "']").addClass("is-active").siblings().removeClass("is-active");
  });


});


// this should be replaced with OPEN CLOSE when the HTML is finalised
$(function() {
  // if javascript works add hide class so we can hide the hidden bits
  $('.idsym-g').toggleClass('hide');

  // add event listener so clicking on h2 will toggle the hide class in the li
  $( ".idsym-g" ).on( "click", function() {
    $(this).toggleClass('hide');
  });
});


