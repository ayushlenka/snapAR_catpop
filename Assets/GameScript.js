//@input Component.Image howToImage
//@input Component.Text countdownText
//@input Component.Text scoreText
//@input Component.Image[] catImages
//@input Component.Image[] raccoonImages
//@input Component.Image endScreenImage
//@input Component.Text endResultText

var gameStarted = false;
var gameFinished = false; // 🔒 Prevent restart after game ends
var score = 0;
var popupInterval = 1.5;
var popupDuration = 1.2;
var gameTime = 30;

var gameTimerEvent = null;

hideAllAnimals();
script.endScreenImage.enabled = false;
script.endResultText.enabled = false;

// Main tap to start
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function(event) {
    if (!gameStarted && !gameFinished) {
        script.howToImage.enabled = false;
        gameStarted = true;
        startCountdown();
        print("✅ How to Play dismissed, starting countdown!");
    }
});

function hideAllAnimals() {
    for (var i = 0; i < script.catImages.length; i++) {
        script.catImages[i].enabled = false;
    }
    for (var j = 0; j < script.raccoonImages.length; j++) {
        script.raccoonImages[j].enabled = false;
    }
}

function startCountdown() {
    var count = 3;
    script.countdownText.enabled = true;
    script.countdownText.text = count.toString();

    var countdownEvent = script.createEvent("DelayedCallbackEvent");
    countdownEvent.bind(function() {
        count--;
        if (count > 0) {
            script.countdownText.text = count.toString();
            countdownEvent.reset(1);
        } else {
            script.countdownText.enabled = false;
            script.scoreText.text = "Score: 0";
            startGame();
        }
    });
    countdownEvent.reset(1);
}

function startGame() {
    print("🚀 Game started!");
    score = 0;
    popupInterval = 1.5;
    popupDuration = 1.2;
    gameStarted = true;
    gameFinished = false;

    script.scoreText.text = "Score: 0";
    script.endScreenImage.enabled = false;
    script.endResultText.enabled = false;

    hideAllAnimals();
    startGameTimer();
    scheduleNextPopup();
}

function startGameTimer() {
    gameTimerEvent = script.createEvent("DelayedCallbackEvent");
    gameTimerEvent.bind(function() {
        print("⏰ 30-second timer finished!");
        endGame(true);
    });
    gameTimerEvent.reset(gameTime);
}

function scheduleNextPopup() {
    if (!gameStarted) return;

    var delay = popupInterval;
    var popupEvent = script.createEvent("DelayedCallbackEvent");
    popupEvent.bind(function() {
        showRandomAnimal();
        scheduleNextPopup();
    });
    popupEvent.reset(delay);
}

function showRandomAnimal() {
    if (score >= 5) {
        popupInterval = Math.max(0.8, popupInterval - 0.1);
        popupDuration = Math.max(0.7, popupDuration - 0.1);
    }
    if (score >= 10) {
        popupInterval = Math.max(0.6, popupInterval - 0.1);
        popupDuration = Math.max(0.5, popupDuration - 0.1);
    }
    if (score >= 15) {
        popupInterval = Math.max(0.4, popupInterval - 0.1);
        popupDuration = Math.max(0.4, popupDuration - 0.1);
    }

    var isRaccoon = Math.random() < 0.2;
    var targetArray = isRaccoon ? script.raccoonImages : script.catImages;
    var index = Math.floor(Math.random() * targetArray.length);
    var animal = targetArray[index];

    animal.enabled = true;
    animal.getSceneObject().isRaccoon = isRaccoon;

    var hideEvent = script.createEvent("DelayedCallbackEvent");
    hideEvent.bind(function() {
        animal.enabled = false;
    });
    hideEvent.reset(popupDuration);
}

var tapEventAnimals = script.createEvent("TapEvent");
tapEventAnimals.bind(function(event) {
    if (!gameStarted) return;

    var tapPos = event.getTapPosition();
    var allAnimals = script.catImages.concat(script.raccoonImages);

    for (var i = 0; i < allAnimals.length; i++) {
        var animal = allAnimals[i];
        if (!animal.enabled) continue;

        var st = animal.getSceneObject().getComponent("Component.ScreenTransform");
        if (st && st.containsScreenPoint(tapPos)) {
            if (animal.getSceneObject().isRaccoon) {
                print("💥 Tapped a raccoon! Game over!");
                endGame(false);
            } else {
                score++;
                script.scoreText.text = "Score: " + score;
                animal.enabled = false;
                print("✅ Tapped a cat! Score: " + score);
            }
            break;
        }
    }
});

function endGame(didWin) {
    gameStarted = false;
    gameFinished = true; // 🔒 Lock out restart taps

    if (gameTimerEvent) {
        gameTimerEvent.enabled = false;
    }

    hideAllAnimals();

    script.endScreenImage.enabled = true;
    script.endResultText.enabled = true;

    var message = didWin ? "#1 Cat Parent!" : "Game Over!";
    script.endResultText.text = message + " Score: " + score;

    print(didWin ? "🏆 Game won!" : "💥 Game lost!");
}
