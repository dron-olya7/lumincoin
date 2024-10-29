const popupOverlay = $("#popup-overlay");
const popup = $("#popup");
const noDelete = $('.no-delete');

function showPopup() {
    popupOverlay.css("display", "block");
    popup.css("display", "block");
}

$(document).on("mousedown", function(e) {
    if ((e.target).closest(".popupOverlay") === null) {
        popupOverlay.css("display", "none");
        popup.css("display", "none");
    }
});