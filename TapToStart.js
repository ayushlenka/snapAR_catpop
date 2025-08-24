//@input Component.Image howToPlayImage

var tapped = false;

function onTap() {
    if (tapped) return;
    tapped = true;

    // Hide the How to Play image
    script.howToPlayImage.enabled = false;

    // Call your start game logic
    if (global.start_game) {
        global.start_game();
    }
}

var touchComponent = script.createEvent("TapEvent");
touchComponent.bind(onTap);
