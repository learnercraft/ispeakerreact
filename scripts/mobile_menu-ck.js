// add event listener so clicking on h2 will toggle the hide class in the li
$(".menu_button").on("click",function(){$(this).parent().toggleClass("hide");return!0});