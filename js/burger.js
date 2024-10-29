let burger = $("#burger");
let sidebar = $("#col-auto");

$(document).ready(function(){
    $(burger).on("click", function(){
        $(sidebar).toggleClass("open");
    })
})