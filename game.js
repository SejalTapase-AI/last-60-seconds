const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const mobileAction =
    document.getElementById("mobileAction");

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");


/* =========================================
   CANVAS
========================================= */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (player) {

        player.x = Math.min(
            player.x,
            canvas.width - player.size / 2
        );

        player.y = Math.min(
            player.y,
            canvas.height - player.size / 2
        );

    }
}


/* =========================================
   PLAYER
========================================= */

const player = {

    x: window.innerWidth / 2,
    y: window.innerHeight / 2,

    size: 30,

    speed: 5

};


/* =========================================
   POINT
========================================= */

const point = {

    x: 100,
    y: 100,

    size: 11,

    value: 10

};


/* =========================================
   GAME STATE
========================================= */

let enemies = [];

let particles = [];

let score = 0;

let timeLeft = 60;

let gameState = "start";

let currentPhase = 1;

let screenShake = 0;

let flash = 0;

let eventMessage = "";

let eventTimer = 0;

let pointBoost = false;


/* =========================================
   HIGH SCORE
========================================= */

let bestScore =
    Number(
        localStorage.getItem(
            "last60Best"
        )
    ) || 0;


/* =========================================
   MOBILE DETECTION
========================================= */

function isMobile() {

    return window.matchMedia(
        "(hover: none) and (pointer: coarse)"
    ).matches;

}


/* =========================================
   MOBILE JOYSTICK
========================================= */

let joystickActive = false;

let joystickX = 0;

let joystickY = 0;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let dx =
        clientX - centerX;

    let dy =
        clientY - centerY;

    const distance =
        Math.hypot(
            dx,
            dy
        );

    const radius =
        rect.width / 2;


    if (distance > radius) {

        dx =
            (dx / distance) *
            radius;

        dy =
            (dy / distance) *
            radius;

    }


    joystickX =
        dx / radius;

    joystickY =
        dy / radius;


    const knobLimit =
        radius - 27.5;

    const knobX =
        joystickX *
        knobLimit;

    const knobY =
        joystickY *
        knobLimit;


    joystickKnob.style.transform =
        `translate(
            ${knobX}px,
            ${knobY}px
        )`;

}


function resetJoystick() {

    joystickActive = false;

    joystickX = 0;

    joystickY = 0;

    joystickKnob.style.transform =
        "translate(0, 0)";

}


/* =========================================
   JOYSTICK TOUCH EVENTS
========================================= */

joystick.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        joystickActive = true;

        const touch =
            event.touches[0];

        updateJoystick(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


joystick.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();

        if (!joystickActive)
            return;

        const touch =
            event.touches[0];

        updateJoystick(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


joystick.addEventListener(
    "touchend",
    event => {

        event.preventDefault();

        resetJoystick();

    },
    {
        passive: false
    }
);


/* =========================================
   KEYBOARD
========================================= */

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            gameState === "start" &&
            key === "enter"
        ) {

            startGame();

            return;

        }


        if (
            (
                gameState === "gameover" ||
                gameState === "won"
            ) &&
            key === "r"
        ) {

            restartGame();

            return;

        }


        keys[key] = true;

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =========================================
   MOBILE ACTION BUTTON
========================================= */

mobileAction.addEventListener(
    "click",
    () => {

        if (
            gameState === "start"
        ) {

            startGame();

        }

        else if (
            gameState === "gameover" ||
            gameState === "won"
        ) {

            restartGame();

        }

    }
);


/* =========================================
   MOBILE BUTTON UI
========================================= */

function updateMobileButton() {

    if (!isMobile())
        return;


    if (
        gameState === "start"
    ) {

        mobileAction.textContent =
            "TAP TO START";

        mobileAction.style.display =
            "block";

    }

    else if (
        gameState === "gameover" ||
        gameState === "won"
    ) {

        mobileAction.textContent =
            "TAP TO RESTART";

        mobileAction.style.display =
            "block";

    }

    else {

        mobileAction.style.display =
            "none";

    }

}


/* =========================================
   START GAME
========================================= */

function startGame() {

    score = 0;

    timeLeft = 60;

    currentPhase = 1;

    enemies = [];

    particles = [];

    pointBoost = false;

    point.value = 10;

    eventMessage = "";

    eventTimer = 0;

    screenShake = 0;

    flash = 0;

    gameState = "playing";


    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;


    spawnEnemy();

    movePoint();

    resetJoystick();

    updateMobileButton();

}


/* =========================================
   RESTART
========================================= */

function restartGame() {

    startGame();

}


/* =========================================
   SPAWN ENEMY
========================================= */

function spawnEnemy() {

    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (side === 0) {

        x =
            Math.random() *
            canvas.width;

        y = -40;

    }

    else if (side === 1) {

        x =
            canvas.width + 40;

        y =
            Math.random() *
            canvas.height;

    }

    else if (side === 2) {

        x =
            Math.random() *
            canvas.width;

        y =
            canvas.height + 40;

    }

    else {

        x = -40;

        y =
            Math.random() *
            canvas.height;

    }


    enemies.push({

        x,

        y,

        size: 30,

        speed:
            1.4 +
            Math.random() * 0.5,

        type:
            enemies.length === 0
                ? "BUG"
                : "REGRESSION"

    });

}


/* =========================================
   MOVE POINT
========================================= */

function movePoint() {

    point.x =
        Math.random() *
        (canvas.width - 100) +
        50;

    point.y =
        Math.random() *
        (canvas.height - 100) +
        50;

}


/* =========================================
   PLAYER MOVEMENT
========================================= */

function movePlayer() {

    let moveX = 0;

    let moveY = 0;


    /* -------------------------------------
       KEYBOARD INPUT
    ------------------------------------- */

    if (
        keys["a"] ||
        keys["arrowleft"]
    )
        moveX -= 1;


    if (
        keys["d"] ||
        keys["arrowright"]
    )
        moveX += 1;


    if (
        keys["w"] ||
        keys["arrowup"]
    )
        moveY -= 1;


    if (
        keys["s"] ||
        keys["arrowdown"]
    )
        moveY += 1;


    /* -------------------------------------
       JOYSTICK INPUT
    ------------------------------------- */

    if (joystickActive) {

        moveX = joystickX;

        moveY = joystickY;

    }


    const magnitude =
        Math.hypot(
            moveX,
            moveY
        );


    /* =====================================
       KEYBOARD MOVEMENT
       Full speed
    ===================================== */

    if (!joystickActive) {

        if (magnitude > 0) {

            moveX /= magnitude;
            moveY /= magnitude;

        }

    }


    /* =====================================
       JOYSTICK MOVEMENT
       VARIABLE SPEED
    ===================================== */

    else {

        const deadZone = 0.15;


        /* Tiny movements are ignored */

        if (
            magnitude < deadZone
        ) {

            moveX = 0;

            moveY = 0;

        }

        else {

            /*
             * Remove the dead zone.
             *
             * Example:
             *
             * 0.15 = barely moving
             * 0.50 = medium movement
             * 1.00 = full movement
             */

            const adjustedMagnitude =
                (magnitude - deadZone) /
                (1 - deadZone);


            /*
             * Smooth acceleration.
             *
             * Squaring the value makes
             * small joystick movements
             * much slower.
             */

            const smoothMagnitude =
                adjustedMagnitude *
                adjustedMagnitude;


            moveX =
                (moveX / magnitude) *
                smoothMagnitude;

            moveY =
                (moveY / magnitude) *
                smoothMagnitude;

        }

    }


    /* =====================================
       APPLY MOVEMENT
    ===================================== */

    player.x +=
        moveX *
        player.speed;

    player.y +=
        moveY *
        player.speed;


    /* =====================================
       SCREEN BOUNDARIES
    ===================================== */

    player.x =
        Math.max(
            player.size / 2,

            Math.min(
                canvas.width -
                player.size / 2,

                player.x
            )
        );


    player.y =
        Math.max(
            player.size / 2,

            Math.min(
                canvas.height -
                player.size / 2,

                player.y
            )
        );

}


/* =========================================
   MOVE ENEMIES
========================================= */

function moveEnemies() {

    enemies.forEach(
        enemy => {

            const dx =
                player.x -
                enemy.x;

            const dy =
                player.y -
                enemy.y;

            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                distance === 0
            )
                return;


            enemy.x +=
                (
                    dx / distance
                ) *
                enemy.speed;

            enemy.y +=
                (
                    dy / distance
                ) *
                enemy.speed;

        }
    );

}


/* =========================================
   PARTICLES
========================================= */

function createParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 20;
        i++
    ) {

        particles.push({

            x,

            y,

            vx:
                (
                    Math.random() -
                    0.5
                ) * 5,

            vy:
                (
                    Math.random() -
                    0.5
                ) * 5,

            life: 1,

            size:
                Math.random() *
                4 + 2

        });

    }

}


function updateParticles() {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx;

            particle.y +=
                particle.vy;

            particle.life -=
                0.03;

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );

}


function drawParticles() {

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                "#00d9ff";


            ctx.beginPath();


            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );


            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;

}


/* =========================================
   COLLISIONS
========================================= */

function checkCollisions() {

    const pointDistance =
        Math.hypot(
            player.x -
            point.x,

            player.y -
            point.y
        );


    if (
        pointDistance <
        player.size / 2 +
        point.size
    ) {

        score +=
            point.value;


        createParticles(
            point.x,
            point.y
        );


        movePoint();

    }


    for (
        const enemy of enemies
    ) {

        const distance =
            Math.hypot(
                player.x -
                enemy.x,

                player.y -
                enemy.y
            );


        if (
            distance <
            player.size / 2 +
            enemy.size / 2
        ) {

            gameState =
                "gameover";

            screenShake = 25;

            flash = 1;

            saveBestScore();

            resetJoystick();

            updateMobileButton();

            return;

        }

    }

}


/* =========================================
   EVENTS
========================================= */

function triggerEvent(
    message
) {

    eventMessage =
        message;

    eventTimer = 180;

}


/* =========================================
   DIFFICULTY
========================================= */

function updateDifficulty() {

    const elapsed =
        60 - timeLeft;


    if (
        elapsed >= 10 &&
        currentPhase < 2
    ) {

        currentPhase = 2;

        triggerEvent(
            "🐛 GREAT. ANOTHER BUG."
        );

        spawnEnemy();

    }


    if (
        elapsed >= 20 &&
        currentPhase < 3
    ) {

        currentPhase = 3;

        triggerEvent(
            "📉 REGRESSION DETECTED."
        );

        spawnEnemy();

    }


    if (
        elapsed >= 30 &&
        !pointBoost
    ) {

        pointBoost = true;

        point.value = 30;

        triggerEvent(
            "💰 FREE MARKS! DON'T ASK WHY."
        );

    }


    if (
        elapsed >= 40 &&
        currentPhase < 4
    ) {

        currentPhase = 4;

        triggerEvent(
            "👥 GROUP PROJECT MODE."
        );

        spawnEnemy();

    }


    if (
        timeLeft <= 10
    ) {

        if (
            currentPhase < 5
        ) {

            currentPhase = 5;

            triggerEvent(
                "🚨 DEADLINE INCOMING."
            );

        }


        enemies.forEach(
            enemy => {

                enemy.speed =
                    Math.min(
                        enemy.speed +
                        0.001,

                        4
                    );

            }
        );

    }

}


/* =========================================
   UPDATE
========================================= */

function update() {

    updateParticles();


    if (
        screenShake > 0
    ) {

        screenShake *= 0.9;

    }


    if (
        flash > 0
    ) {

        flash -= 0.05;

    }


    if (
        eventTimer > 0
    ) {

        eventTimer--;

    }


    if (
        gameState !== "playing"
    ) {

        return;

    }


    movePlayer();

    moveEnemies();

    checkCollisions();

    updateDifficulty();

}


/* =========================================
   GRID
========================================= */

function drawGrid() {

    const gridSize = 50;


    ctx.strokeStyle =
        "rgba(0, 217, 255, 0.07)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


/* =========================================
   PLAYER DRAW
========================================= */

function drawPlayer() {

    ctx.save();

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "#00ff88";

    ctx.fillStyle =
        "#00ff88";


    ctx.fillRect(
        player.x -
        player.size / 2,

        player.y -
        player.size / 2,

        player.size,

        player.size
    );


    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "#06100b";

    ctx.font =
        "bold 14px Arial";

    ctx.textAlign =
        "center";


    ctx.fillText(
        "• •",

        player.x,

        player.y - 1
    );


    ctx.fillText(
        "ᴗ",

        player.x,

        player.y + 12
    );


    ctx.textAlign =
        "left";

    ctx.restore();

}


/* =========================================
   POINT DRAW
========================================= */

function drawPoint() {

    ctx.save();

    ctx.shadowBlur = 35;

    ctx.shadowColor =
        pointBoost
            ? "#ffcc00"
            : "#00d9ff";

    ctx.fillStyle =
        pointBoost
            ? "#ffcc00"
            : "#00d9ff";


    ctx.beginPath();


    ctx.arc(
        point.x,
        point.y,
        point.size,
        0,
        Math.PI * 2
    );


    ctx.fill();

    ctx.restore();

}


/* =========================================
   ENEMY DRAW
========================================= */

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();

            ctx.shadowBlur = 30;

            ctx.shadowColor =
                "#ff304f";

            ctx.fillStyle =
                "#ff304f";


            ctx.fillRect(
                enemy.x -
                enemy.size / 2,

                enemy.y -
                enemy.size / 2,

                enemy.size,

                enemy.size
            );


            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "#1a0005";

            ctx.font =
                "bold 13px Arial";

            ctx.textAlign =
                "center";


            ctx.fillText(
                "× ×",

                enemy.x,

                enemy.y
            );


            ctx.fillText(
                "▿",

                enemy.x,

                enemy.y + 11
            );


            ctx.textAlign =
                "left";

            ctx.restore();

        }
    );

}


/* =========================================
   RESPONSIVE SCALE
========================================= */

function getScale() {

    return Math.min(
        canvas.width / 1000,
        canvas.height / 700,
        1
    );

}


/* =========================================
   HUD
========================================= */

function drawHUD() {

    const scale =
        getScale();


    const margin =
        Math.max(
            18,
            30 * scale
        );


    const scoreSize =
        Math.max(
            22,
            28 * scale
        );


    const smallSize =
        Math.max(
            11,
            14 * scale
        );


    ctx.fillStyle =
        "#888";

    ctx.font =
        `bold ${smallSize}px Arial`;


    ctx.fillText(
        "SCORE",

        margin,

        margin
    );


    ctx.fillStyle =
        pointBoost
            ? "#ffcc00"
            : "#00d9ff";


    ctx.font =
        `bold ${scoreSize}px Arial`;


    ctx.fillText(
        score,

        margin,

        margin + scoreSize
    );


    ctx.fillStyle =
        "#888";

    ctx.font =
        `${smallSize}px Arial`;


    ctx.fillText(
        `BEST: ${bestScore}`,

        margin,

        margin +
        scoreSize +
        22
    );


    const deadlineX =
        canvas.width -
        margin -
        80;


    ctx.fillStyle =
        "#888";

    ctx.font =
        `bold ${smallSize}px Arial`;


    ctx.fillText(
        "DEADLINE",

        deadlineX,

        margin
    );


    ctx.fillStyle =
        timeLeft <= 10
            ? "#ff304f"
            : "#00ff88";


    ctx.font =
        `bold ${scoreSize}px Arial`;


    ctx.fillText(
        `${Math.ceil(timeLeft)}s`,

        deadlineX,

        margin + scoreSize
    );


    ctx.fillStyle =
        "#888";

    ctx.font =
        `${smallSize}px Arial`;


    ctx.fillText(
        `BUGS: ${enemies.length}`,

        margin,

        canvas.height -
        20
    );


    ctx.fillText(
        `PHASE: ${currentPhase}`,

        canvas.width -
        margin -
        70,

        canvas.height -
        20
    );

}


/* =========================================
   EVENT MESSAGE
========================================= */

function drawEventMessage() {

    if (
        eventTimer <= 0
    )
        return;


    const scale =
        getScale();


    ctx.save();

    ctx.textAlign =
        "center";


    ctx.globalAlpha =
        Math.min(
            eventTimer / 30,
            1
        );


    ctx.fillStyle =
        "#ffcc00";


    ctx.font =
        `bold ${Math.max(
            16,
            26 * scale
        )}px Arial`;


    ctx.fillText(
        eventMessage,

        canvas.width / 2,

        110 * scale
    );


    ctx.restore();

}


/* =========================================
   START SCREEN
========================================= */

function drawStartScreen() {

    const mobile =
        isMobile();


    const scale =
        mobile
            ? Math.min(
                canvas.width / 420,
                canvas.height / 850
            )
            : getScale();


    ctx.textAlign =
        "center";


    ctx.shadowBlur = 30;

    ctx.shadowColor =
        "#00ff88";

    ctx.fillStyle =
        "#00ff88";


    const titleSize =
        mobile
            ? Math.max(
                30,
                55 * scale
            )
            : 68;


    ctx.font =
        `bold ${titleSize}px Arial`;


    const titleY =
        mobile
            ? canvas.height * 0.27
            : canvas.height / 2 - 100;


    if (mobile) {

        ctx.fillText(
            "THE LAST",

            canvas.width / 2,

            titleY
        );


        ctx.fillText(
            "60 SECONDS",

            canvas.width / 2,

            titleY +
            titleSize * 1.15
        );

    }

    else {

        ctx.fillText(
            "THE LAST 60 SECONDS",

            canvas.width / 2,

            titleY
        );

    }


    ctx.shadowBlur = 0;


    ctx.fillStyle =
        "white";


    ctx.font =
        `${mobile ? 15 : 20}px Arial`;


    ctx.fillText(
        "Collect points. Avoid bugs. Regret everything.",

        canvas.width / 2,

        mobile
            ? titleY +
              titleSize * 2 +
              35
            : canvas.height / 2 - 45
    );


    ctx.fillStyle =
        "#aaa";


    ctx.font =
        `${mobile ? 13 : 18}px Arial`;


    ctx.fillText(
        "The longer you survive, the worse your life gets.",

        canvas.width / 2,

        mobile
            ? titleY +
              titleSize * 2 +
              62
            : canvas.height / 2
    );


    if (!mobile) {

        ctx.fillStyle =
            "#666";

        ctx.font =
            "14px Arial";


        ctx.fillText(
            "WASD / ARROW KEYS",

            canvas.width / 2,

            canvas.height / 2 + 135
        );

    }


    ctx.textAlign =
        "left";

}


/* =========================================
   RATING
========================================= */

function getRating() {

    if (score >= 500)
        return "S+";

    if (score >= 400)
        return "S";

    if (score >= 300)
        return "A";

    if (score >= 200)
        return "B";

    if (score >= 100)
        return "C";

    return "F";

}


function getComment() {

    const rating =
        getRating();


    if (rating === "S+")
        return "Please touch grass.";

    if (rating === "S")
        return "Absolutely unhinged.";

    if (rating === "A")
        return "Okay, show-off.";

    if (rating === "B")
        return "Respectable.";

    if (rating === "C")
        return "You survived. Barely.";

    return "The deadline won.";

}


/* =========================================
   SAVE SCORE
========================================= */

function saveBestScore() {

    if (
        score > bestScore
    ) {

        bestScore =
            score;

        localStorage.setItem(
            "last60Best",
            bestScore
        );

    }

}


/* =========================================
   END SCREEN
========================================= */

function drawEndScreen() {

    saveBestScore();


    ctx.fillStyle =
        "rgba(0, 0, 0, 0.88)";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const mobile =
        isMobile();


    const scale =
        mobile
            ? Math.min(
                canvas.width / 420,
                canvas.height / 850
            )
            : getScale();


    ctx.textAlign =
        "center";


    const survived =
        gameState === "won";


    ctx.fillStyle =
        survived
            ? "#00ff88"
            : "#ff304f";


    ctx.font =
        `bold ${Math.max(
            30,
            52 * scale
        )}px Arial`;


    ctx.fillText(
        survived
            ? "YOU DID IT"
            : "YOU GOT COOKED",

        canvas.width / 2,

        canvas.height * 0.28
    );


    ctx.fillStyle =
        "white";


    ctx.font =
        `${mobile ? 14 : 20}px Arial`;


    ctx.fillText(
        survived
            ? "The deadline has been defeated."
            : "The bugs have claimed another victim.",

        canvas.width / 2,

        canvas.height * 0.36
    );


    ctx.fillStyle =
        "#00d9ff";


    ctx.font =
        `bold ${mobile ? 26 : 32}px Arial`;


    ctx.fillText(
        `SCORE: ${score}`,

        canvas.width / 2,

        canvas.height * 0.45
    );


    ctx.fillStyle =
        "#aaa";


    ctx.font =
        `${mobile ? 16 : 18}px Arial`;


    ctx.fillText(
        `BEST: ${bestScore}`,

        canvas.width / 2,

        canvas.height * 0.50
    );


    ctx.fillStyle =
        "#ffcc00";


    ctx.font =
        `bold ${mobile ? 34 : 42}px Arial`;


    ctx.fillText(
        `RATING: ${getRating()}`,

        canvas.width / 2,

        canvas.height * 0.57
    );


    ctx.fillStyle =
        "white";


    ctx.font =
        `${mobile ? 14 : 18}px Arial`;


    ctx.fillText(
        `"${getComment()}"`,

        canvas.width / 2,

        canvas.height * 0.63
    );


    if (!mobile) {

        ctx.fillStyle =
            "#00ff88";

        ctx.font =
            "bold 20px Arial";


        ctx.fillText(
            "[ R ] TRY AGAIN",

            canvas.width / 2,

            canvas.height * 0.72
        );

    }


    ctx.textAlign =
        "left";

}


/* =========================================
   DRAW
========================================= */

function draw() {

    ctx.fillStyle =
        "#050811";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawGrid();


    if (
        gameState === "start"
    ) {

        drawStartScreen();

        return;

    }


    ctx.save();


    if (
        screenShake > 0
    ) {

        ctx.translate(
            (
                Math.random() -
                0.5
            ) *
            screenShake,

            (
                Math.random() -
                0.5
            ) *
            screenShake
        );

    }


    drawPoint();

    drawPlayer();

    drawEnemies();

    drawParticles();


    ctx.restore();


    drawHUD();

    drawEventMessage();


    if (
        gameState === "gameover" ||
        gameState === "won"
    ) {

        drawEndScreen();

    }


    if (
        flash > 0
    ) {

        ctx.fillStyle =
            `rgba(
                255,
                48,
                79,
                ${flash}
            )`;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

}


/* =========================================
   TIMER
========================================= */

setInterval(
    () => {

        if (
            gameState === "playing"
        ) {

            timeLeft--;


            if (
                timeLeft <= 0
            ) {

                timeLeft = 0;

                gameState =
                    "won";

                saveBestScore();

                resetJoystick();

                updateMobileButton();

            }

        }

    },

    1000
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        resizeCanvas();

        updateMobileButton();

    }
);


/* =========================================
   GAME LOOP
========================================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================
   INITIALIZE
========================================= */

resizeCanvas();

updateMobileButton();

gameLoop();