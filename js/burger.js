let burger = document.getElementById("burger");
let sidebar = document.getElementById("col-auto");

document.addEventListener("DOMContentLoaded", function(){
    burger.addEventListener("click", function(){
        sidebar.classList.toggle("open");
    })
})