const popupOverlay = document.getElementById("popup-overlay");
const popup = document.getElementById("popup");
 
function showPopup() {
    popupOverlay.style.display = "block";
    popup.style.display = "block";
}
 
// function closePopup() {
//     // var popup = document.querySelector('.popup');
//     popupOverlay.style.display = 'none';
// }
 
// popupOverlay.addEventListener("click", hidePopup);
// popup.addEventListener("click", (event)=&gt; event.stopPropagation());


document.addEventListener('mousedown', function(e){
    if(e.target.closest('.popupOverlay') === null){
        popupOverlay.style.display = "none";
        popup.style.display = 'none';
    }
});