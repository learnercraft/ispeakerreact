$(function() {
  // if javascript works add hide class so we can hide the hidden bits
  $('.toggle-open dt').toggleClass('hide');

  // add event listener so clicking on h2 will toggle the hide class in the li
  $( ".toggle-open dt" ).on( "click", function() {
    $(this).toggleClass('hide');
  });
});