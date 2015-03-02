/*Variables*/
//consts
var SIZE = 64;
//arrow key codes
var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;
//Map code
var SPACE = 0;
var ENEMY = 1;
var PLANET = 2;
var HOME = 3;
var ALIEN = 4;
var SHIP = 5;
//image array
var images = ["space.png", "enemy.png", "planet.png", "home.png", "alien.png", "ship.png"];
//Map
var map = [];
var gameObjects = [];

//Map dimensions
var ROWS;
var COLUMNS;
//ship and alien position variables
var shipRow;
var shipCol;
var alienRow;
var alienCol;

//game variables
var oxygen = 10;
var platinum = 10;
var experience = 0;
var gameMessage = "";

//html elements
//Div "pages"
var startPage = document.querySelector("#startPage");
var game = document.querySelector("#game");
var endGameDiv = document.querySelector("#endGame");
//game stage and output
var stage = document.querySelector("#stage");
var output = document.querySelector("#output");
var endHeader = document.querySelector("#endHeader");
var endMessage = document.querySelector("#endMessage");
//Music
var music = document.querySelector("#music");
//buttons
var play = document.querySelector("#play");
var playMusicBtn = document.querySelector("#playMusic");
var pauseMusicBtn = document.querySelector("#pauseMusic");
var resetBtn = document.querySelector("#reset");


/*Functions*/
//helper functions
//Initialize maps and ship and alien positions
//Separated so that it can be called again in reset.
function init() {
    //initialize map and game object array
    map = [
    [0, 0, 3, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 1],
    [2, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 2, 0, 0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 2, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 1, 0]
    ];

    gameObjects = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 4, 0, 0, 5, 0, 0]
    ];
    //Initialize ROWS and COLUMNS
    ROWS = map.length;
    COLUMNS = map[0].length;

    //initialize ship and alien positions
    //Loop through game object map to find ship and alien
    for (var thisRow = 0; thisRow < ROWS; thisRow++) {
        for (var thisCol = 0; thisCol < COLUMNS; thisCol++) {
            if (gameObjects[thisRow][thisCol] === SHIP) {
                shipRow = thisRow;
                shipCol = thisCol;
            } else if (gameObjects[thisRow][thisCol] === ALIEN) {
                alienRow = thisRow;
                alienCol = thisCol;
            }
        }
    }
}

//fight enemies for platinum
function fight() {
    //Generate random strengths for player and enemy. Favors enemy slightly.
    var playerStrength = Math.floor(Math.random() *(platinum * 2 + oxygen));
    var enemyStrength = Math.floor(Math.random() * (platinum * 3 + oxygen));
    //Generate random money to win/lose
    var enemyMoney = Math.floor(Math.random() * (playerStrength / 2));
    //Check winner
    if (playerStrength > enemyStrength) {
        //Player win - set message and give money
        gameMessage += "You have defeated the enemy ship. You take their platinum.";
        platinum += enemyMoney;
        //Give extra experience for a win
        experience++;
    } else {
        //Player lost - set message and take some money
        gameMessage += "You have lost. The enemy steals some of your platinum.";
        platinum -= Math.floor(enemyMoney / 3);
    }
    //Always get at least one experience point
    experience++;
}

//trade for oxygen
function trade() {
    //Generate random number of oxygen tanks
    var oxygenTanks = Math.floor(Math.random() * platinum) + 2;
    //Generate random cost based on number of oxygen tanks
    var cost = oxygenTanks * (Math.floor(Math.random()) + 1);

    //Check if player can buy the oxygen
    if (cost < platinum) {
        //Player can buy - set game message and add oxygen tanks to oxygen
        gameMessage += "You buy " + oxygenTanks +" more oxygen tanks for " + cost + " platinum coins.";
        oxygen += oxygenTanks;
        //Get extra experience for successful purchase
        experience++;
    } else {
        //Player can't buy - set game message
        gameMessage += "You don't have enough money to trade.";
    }
    //Always get one experience for trying
    experience++;
}

//called if out of oxygen, eaten by alien, or won
function endGame() {
    //stop music
    music.pause();

    //show ending page
    game.style.display = "none";
    endGameDiv.style.display = "block";

    //remove keydown listener
    window.removeEventListener("keydown", keyHandler, false);

    //check how player reached end
    if (map[shipRow][shipCol] === HOME) {
        //won
        endHeader.innerHTML = "You have won!";
        endMessage.innerHTML = "Final Score: " + (platinum + oxygen + experience);

    } else {
        //lost
        endHeader.innerHTML = "You have lost!";
        if (gameObjects[shipRow][shipCol] === ALIEN) {
            //Eaten by alien
            endMessage.innerHTML = "You have been eaten by the alien!";
        } else {
            //Out of oxygen
            endMessage.innerHTML = "You have run out of oxygen!";
        }
    }

    //Show platinum, oxygen, and experience whether won or lost
    endMessage.innerHTML += "<br/> Platinum: " + platinum + "<br/> Oxygen: " +
        oxygen + "<br/> Experience: " + experience;
    
}

//Randomly move alien each turn
function moveAlien() {
    //Variables for valid directions, chosen direction, and random number to choose direction
    var validDirections = [];
    var dir;
    var ranNum;

    //find valid directions
    /*For each direction, make sure alien is not at border, then check to see if the next space in that 
    direction is empty space*/
    //Constants for the key codes are used here to represent the directions
    //to prevent naming multiple variables the same name

    //check up
    if (alienRow > 0) {
        if (map[alienRow - 1][alienCol] === SPACE) {
            validDirections.push(UP);
        }
    }
    //check down
    if (alienRow < ROWS - 1) {
        if (map[alienRow + 1][alienCol] === SPACE) {
            validDirections.push(DOWN);
        }
    }
    
    //check right 
    if (alienCol < COLUMNS - 1) {
        if (map[alienRow][alienCol + 1] === SPACE) {
            validDirections.push(RIGHT);
        }
    }
   
    //check left
    if (alienCol > 0) {
        if (map[alienRow][alienCol - 1] === SPACE) {
            validDirections.push(LEFT);
        }
    }
    
    //choose random direction from valid directions
    if (validDirections.length > 0) {
        ranNum = Math.floor(Math.random() * validDirections.length);
        dir = validDirections[ranNum];
    }

    //Move monster based on direction
    switch (dir) {
        /*For each direction, make sure not to erase the ship if the ship has just moved into the alien's old position. (Just in case the player decides to chase the alien.)*/
        case UP:
            if (gameObjects[alienRow][alienCol] !== SHIP) {
                gameObjects[alienRow][alienCol] = 0;
            }
            alienRow--;
            gameObjects[alienRow][alienCol] = ALIEN;
            break;
        case DOWN:
            if (gameObjects[alienRow][alienCol] !== SHIP) {
                gameObjects[alienRow][alienCol] = 0;
            }
            alienRow++;
            gameObjects[alienRow][alienCol] = ALIEN;
            break;
        case RIGHT:
            if (gameObjects[alienRow][alienCol] !== SHIP) {
                gameObjects[alienRow][alienCol] = 0;
            }
            alienCol++;
            gameObjects[alienRow][alienCol] = ALIEN;
            break;
        case LEFT:
            if (gameObjects[alienRow][alienCol] !== SHIP) {
                gameObjects[alienRow][alienCol] = 0;
            }
            alienCol--;
            gameObjects[alienRow][alienCol] = ALIEN;
            break;
    }
}

//main drawing function
function render() {
    //function variables - used to hold current position and object from 2d arrays for clarity
    var here;
    var thisObject;

    //Clear previous images
    if (stage.hasChildNodes()) {
        for (var i = 0; i < ROWS * COLUMNS; i++) {
            stage.removeChild(stage.firstChild);
        }
    }

    //Add new images
    for (var thisRow = 0; thisRow < ROWS; thisRow++) {
        for (var thisCol = 0; thisCol < COLUMNS; thisCol++) {
            //Create image and add to stage
            var img = document.createElement("img");
            stage.appendChild(img);

            //draw map : using an array to hold images that is parallel to the map code
            //means all that has to be done is use the map code to access the array
            here = map[thisRow][thisCol];
            img.src = "../images/" + images[here];

            //draw moving objects : also uses the array
            if (gameObjects[thisRow][thisCol] === ALIEN || gameObjects[thisRow][thisCol] === SHIP) {
                thisObject = gameObjects[thisRow][thisCol];
                img.src = "../images/" + images[thisObject];
            }

            //position the image : no space between images used
            img.style.left = (SIZE * thisCol ) + "px";
            img.style.top = (SIZE * thisRow ) + "px";
        }
    }

    //add status to game message
    gameMessage += "<br/> Oxygen: " + oxygen + ", Platinum coins: " + platinum +
        ", Experience: " + experience;

    //Render game message
    output.innerHTML = gameMessage;
}

//main game loop
function playGame() {
    //clear game message
    gameMessage = "";

    //check location to decide action
    switch (map[shipRow][shipCol]) {
        case SPACE:
            gameMessage += "The depths of space surround you.";
            break;
        case ENEMY:
            fight();
            break;
        case PLANET:
            trade();
            break;
        case HOME:
            endGame();
            break;
    }

    //move alien
    moveAlien();

    //check if alien collided with ship
    if (gameObjects[shipRow][shipCol] === ALIEN) {
        endGame();
    }

    //lower oxygen each turn
    oxygen--;

    //check if out of oxygen
    if (oxygen === 0) {
        endGame();
    }

    //render changes
    render();
}

/*Handlers*/
//Handles play button click
function playHandler() {
    //Change to game "page"
    startPage.style.display = "none";
    game.style.display = "block";
    //start music
    music.play();
    //Initialize and display map
    init();
    render();
}

//Handles key down event
function keyHandler(e) {
    //Switch on key code using constants for directions
    //Play game is called only if one of the direction keys are pressed
    switch (e.keyCode) {
        case UP:
            if (shipRow > 0) {
                gameObjects[shipRow][shipCol] = 0;
                shipRow--;
                gameObjects[shipRow][shipCol] = SHIP;
            }
            playGame();
            break;
        case DOWN:
            if (shipRow < ROWS - 1) {
                gameObjects[shipRow][shipCol] = 0;
                shipRow++;
                gameObjects[shipRow][shipCol] = SHIP;
            }
            playGame();
            break;
        case LEFT:
            if (shipCol > 0) {
                gameObjects[shipRow][shipCol] = 0;
                shipCol--;
                gameObjects[shipRow][shipCol] = SHIP;
            }
            playGame();
            break;
        case RIGHT:
            if (shipCol < COLUMNS - 1) {
                gameObjects[shipRow][shipCol] = 0;
                shipCol++;
                gameObjects[shipRow][shipCol] = SHIP;
            }
            playGame();
            break;
    }
    
}

//Handles play music button click
function playMusicHandler() {
    //Make sure music was paused so that repeatedly clicking play won't make the music restart
    if (music.paused) {
        music.play();
    }
    
}

//Handles pause music button click
function pauseMusicHandler() {
    //Only try to pause the music if it is not already paused
    if (!music.paused) {
        music.pause();
    }
}

//Handles reset button click. Resets game.
function resetHandler() {
    //Change "page"
    endGameDiv.style.display = "none";
    game.style.display = "block";
    //Restart music
    music.currentTime = 0;
    music.play();
    //Reset game variables
    oxygen = 10;
    platinum = 10;
    experience = 0;
    gameMessage = "";
    //Re-add keydown handler
    window.addEventListener("keydown", keyHandler, false);
    //Reset and render map
    init();
    render();
}

/*Event listeners*/
play.addEventListener("click", playHandler, false);
window.addEventListener("keydown", keyHandler, false);
playMusicBtn.addEventListener("click", playMusicHandler, false);
pauseMusicBtn.addEventListener("click", pauseMusicHandler, false);
resetBtn.addEventListener("click", resetHandler, false);

