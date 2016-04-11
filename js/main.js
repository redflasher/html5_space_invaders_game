/**
 * Created by Alexey Burlakov on 05.04.2016.
 *
 * https://github.com/redflasher/html5_space_invaders_game.git
 */

////////////////////GAME CONFIG///////////////////
Unit.DEFAULT_WIDTH = 0;
Unit.DEFAULT_HEIGHT = 0;
Unit.DEFAULT_SPACE = 0;
Unit.DEFAULT_COLOR = "#c00";
Unit.ENEMY_TYPE = 1;
Unit.PLAYER_TYPE = 2;
Unit.ENEMY_BULLET_TYPE = 3;
Unit.DEFAULT_UNIT_SPEED = 5;
Unit.PLAYER_BULLET_SPEED = 10;
//
//make "delay" between enemy steps (for reduce fps)
Enemy.STEP_TIME_DELAY = Enemy.DEFAULT_STEP_TIME_DELAY = 200;
Enemy.FIRE_TIME_DELAY = 800;//delay between enemy fire (ms)
Enemy.SPEED = Enemy.DOWN_SPEED = 8;//step size of enemy (px)
Enemy.BULLET_SPEED = 2;
Enemy.MAX_ENEMY_BULLETS = 2;//how many enemy bullets can show on screen at the same time
Enemy.COLUMNS = 5;
Enemy.ROWS = Enemy.DEFAULT_ROWS = 4;
Enemy.START_Y = 50;

function Game() {
}
Game.prototype.SCREEN_SIZE = 0;
Game.prototype.context = {};
Game.FRONTIER = 0;
Game.STATUS = "GAME_OVER";
Game.PLATFORM = Game.DESKTOP_PLATFORM;//game platform (desktop or mobile)
Game.DESKTOP_PLATFORM = 0;
Game.MOBILE_PLATFORM = 1;
Game.WINS = 0;//number of wins and level number


//////////////////////////////BASE GAME UNIT///////////////////////////////////////
function Unit(options) {
    this._x = options.x || 0;
    this._y = options.y || 0;
    this._width = options.width || Unit.DEFAULT_WIDTH;
    this._height = options.height || Unit.DEFAULT_HEIGHT;
    this._speed = options.speed || Unit.DEFAULT_UNIT_SPEED;
    this._id = options.id || 0;

    this._type = options.type || Unit.DEFAULT_TYPE;

    if(!options.context) {
        throw new Error("Don't setted Canvas context for Unit");
    }
    this._cxt = options.context;

    //set image sprite
    this._img = new Image();
    switch(this._type) {
        case Unit.ENEMY_TYPE: {
            this._img.src = Unit.ENEMY_SPRITE_1;
            this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
            break;
        }
        case Unit.PLAYER_TYPE: {
            this._img.src = Unit.PLAYER_SPRITE;
            this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
            break;
        }
        case Unit.ENEMY_BULLET_TYPE: {
            this._img.src = Unit.ENEMY_BULLET_SPRITE;
            this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
            break;
        }
        case Unit.PLAYER_BULLET_TYPE: {
            this._img.src = Unit.PLAYER_BULLET_SPRITE;
            this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
            break;
        }
    }
}

Unit.prototype.update = function () {
    this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
};

Unit.prototype.destroy = function () {
    this._cxt.clearRect(this._x,this._y,this._width, this._height);
};

///////////////////PLAYER//GUN////////////////////
function PlayerGun() {
    var self = this;
    Unit.apply(this, arguments);
    this._keyCode = "";
    this._isFire = false;//Is player fire now?

    this._bullet = new Unit({
        x: -10,
        y: -10,
        width: Math.round(this._width / 20),
        height: Math.round(this._height / 3),
        type: Unit.PLAYER_BULLET_TYPE,
        context: this._cxt
    });
    this._bullet.isFly = false;//Is exists flying bullet now?
    this._bullet.destroy = function () {
        Unit.prototype.destroy.apply(this, arguments);
        this.isFly = false;
    }

    this._bullet.hitTestWithEnemy = function () {
        var enemies = army._enemies;
        for(var i = enemies.length - 1; i >= 0; i--) {
            if( this._x > enemies[i]._x
                && this._x < enemies[i]._x + enemies[i]._width ) {
                if( this._y < enemies[i]._y + enemies[i]._height
                    && (this._y + this._height) > enemies[i]._y ) {
                        this.destroy();
                        enemies[i].addToDestroyPull();
                        window.playEnemyDeadSound();
                        break;
                }
            }
        }
    };

    this._bullet.hitTestWithTopScreen = function () {
        if( this._y < -this._height ) this.isFly = false;
    };


    this._bullet.update = function () {
        this._cxt.clearRect(this._x, this._y + Unit.PLAYER_BULLET_SPEED, this._width, this._height);
        this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
    };

    var self = this;

    //Init input handlers
    if(Game.PLATFORM === Game.MOBILE_PLATFORM) { //if this is mobile device
        window.addEventListener("devicemotion", mobileMotion, false);

        var el = document.getElementById("gameCanvas");
        el.addEventListener("touchstart", function (event) {
            self._isFire = true;
        }, false);
        el.addEventListener("touchend", function (event) {
            self._isFire = false;
        }, false);
        el.addEventListener("touchcancel", function (event) {
            self._isFire = false;
        }, false);
        el.addEventListener("touchmove", function (event) {
            self._isFire = true;
        }, false);
    } else {
            document.addEventListener('keydown',desktopInput);
            document.addEventListener('keyup',function (event) {
            self._keyCode = "";
            self._isFire = false;
        });
    }

    //Mobile input
    function mobileMotion(event){
        if(event.accelerationIncludingGravity.x > 2) {
            self._keyCode = "left";
        } else if(event.accelerationIncludingGravity.x < -2) {
            self._keyCode = "right";
        } else {
            self._keyCode = "";
        }
    }

    //Desktop
    function desktopInput(event) {
        self._keyCode = "";
        switch(event.keyCode) {
            case 37:
                self._keyCode = "left";
                break;
            case 39: {
                self._keyCode = "right";
                break;
            }
            case 32: {
                self._isFire = true;
                break;
            }
            default: {
                self._keyCode = "";
                self._isFire = false;
                break;
            }
        }
    }

}

PlayerGun.prototype = Object.create(Unit.prototype);
PlayerGun.prototype.constructor = PlayerGun;

PlayerGun.prototype.inputHandler = function() {
    var newX;
    switch(this._keyCode ){
        case "left": {
            newX = this._x - this._speed;
            if(newX > this._width) this._x = newX;
            break;
        }
        case "right": {
            newX = this._x + this._speed;
            if(newX < Game.SCREEN_SIZE - this._width) this._x = newX;
            break;
        }
    }

    if(this._isFire) {
        this.fire();
    }

    Game.context.clearRect(this._x-this._speed, this._y, this._width+this._speed+10, this._height);
    this.update();
};

PlayerGun.prototype.fire = function() {
    if(!this._bullet.isFly) {
        this._bullet.isFly = true;
        this._bullet._x = this._x + (this._width / 2);
        this._bullet._y = this._y - this._bullet._height;
        window.playPlayerGunSound();
    }
};

PlayerGun.prototype.bulletFlying = function() {
    if( this._bullet.isFly ) {
        this._bullet._y -= Unit.PLAYER_BULLET_SPEED;
        this._bullet.update();
        this._bullet.hitTestWithEnemy();
        this._bullet.hitTestWithTopScreen();
    }
};

///////////////////////////ENEMY//////////////////
function Enemy(options) {
    Unit.apply(this, arguments);
    this._inLineNumberOf = options.inLineNumberOf || 0;//index of line(row) in army array
    this._status = Enemy.ENEMY_LIVE;
};

Enemy.ENEMY_LIVE = 0;
Enemy.ENEMY_DEAD = 1;
Enemy.ENEMY_DELETED = 2;

Enemy.prototype = Object.create(Unit.prototype);
Enemy.prototype.constructor = Enemy;


Enemy.prototype.addToDestroyPull = function(index) {
    this._status = Enemy.ENEMY_DEAD;
};

Enemy.prototype.destroy = function ( num ) {
    Unit.prototype.destroy.apply(this, arguments);
    this._status = Enemy.ENEMY_DELETED;
    if(Enemy.STEP_TIME_DELAY > 10)Enemy.STEP_TIME_DELAY -= 10;//make faster game
};

Enemy.prototype.fire = function(bullet) {
    if(bullet._status == EnemyBullet.IN_STOCK) {
        bullet._x = this._x + (this._width / 2) - (bullet._width/2);
        bullet._y = this._y + this._height;
        bullet._status = EnemyBullet.FLY;
        window.playEnemyGunSound();
    }
};

/////////////////////ENEMY//BULLET//////////////////
function EnemyBullet() {
    Unit.apply(this, arguments);
    this._status = EnemyBullet.IN_STOCK;

    this._width = Math.round(army._enemies[0]._width / 5);
    this._height = Math.round(army._enemies[0]._height / 4);
}

EnemyBullet.IN_STOCK = 0;
EnemyBullet.FLY = 1;
EnemyBullet.DEAD = 2;// need to set back in stock

EnemyBullet.prototype = Object.create(Unit.prototype);
EnemyBullet.prototype.constructor = EnemyBullet;

//render flying bullets
EnemyBullet.prototype.bulletFlying = function() {
    if( this._status === EnemyBullet.FLY ) {
        this._y += Enemy.BULLET_SPEED;
        this.hitTestWithPlayerGun();
        this.hitTestWithPlayerBullet();
        this.hitTestWithBottomScreen();
        this.update();
    }
};

EnemyBullet.prototype.addToDestroyPull = function(index) {
    this._status = EnemyBullet.DEAD;
};

EnemyBullet.prototype.destroy = function () {
    Unit.prototype.destroy.apply(this, arguments);
    this._status = EnemyBullet.IN_STOCK;
    this._x = -this._width;
    this._y = -this._height;
};

EnemyBullet.prototype.hitTestWithBottomScreen = function () {
    if ( this._y > Game.SCREEN_SIZE ) {
        this.addToDestroyPull( this );
    }
};

EnemyBullet.prototype.hitTestWithPlayerGun = function () {
     if (this._x > playerGun._x &&
         this._x < playerGun._x + playerGun._width) {
        if (this._y < playerGun._y + playerGun._height
            && (this._y + this._height) > playerGun._y) {
            this.addToDestroyPull( this );
            window.playPlayerGunDeadSound();
            gameOver();
        }
    }
};

EnemyBullet.prototype.hitTestWithPlayerBullet = function () {
    if (playerGun._bullet._x >= this._x &&
            playerGun._bullet._x < this._x + this._width  ) {
        if (playerGun._bullet._y < this._y + this._height) {
            this.addToDestroyPull( this );
            playerGun._bullet.destroy();
            window.playBulletBulletSound();
        }
    }
};

EnemyBullet.prototype.update = function () {
    this._cxt.clearRect(this._x, this._y - Enemy.BULLET_SPEED, this._width, this._height);
    this._cxt.drawImage(this._img, this._x, this._y, this._width, this._height);
};


///////////////////ARMY/////////////////////////////
var army = {
    _enemies: [],
    _enemyBullets: [],
    _isMoveRight: true,//"we move to the right?"
    _whatLineMakeStep: Enemy.ROWS,// How an army line make own step?(lines move consecutive)
    isCanFire: true,//Can make the shot?
    isCanMakeStep: true,//Can make the step?
    fire: function() {
        var self = this;
        if (!this.isCanFire) return;
        this.isCanFire = false;

        setTimeout(function () {
            self.isCanFire = true;
        }, Enemy.FIRE_TIME_DELAY);

        var bullet;
        for (var i = 0; i < self._enemyBullets.length; i++) {//find "IN_STOCK"(ready) bullet
            if (self._enemyBullets[i]._status === EnemyBullet.IN_STOCK) {
                bullet = self._enemyBullets[i];
                break;
            }
        }
        if (bullet == undefined) return;//if "IN_STOCK" bullets ended we don't fire

        //choose enemy battleship nearest to the player gun
        var lowerEnemy;
        for (var i = this._enemies.length - 1; i > 0; i--) {
            var enemy = this._enemies[i];
            if (enemy._x > playerGun._x && enemy._x + enemy._width < playerGun._x + playerGun._width * 2) {
                lowerEnemy = enemy;
            }
        }

        if (lowerEnemy === undefined)return;

        var colNumber = lowerEnemy._id % Enemy.COLUMNS;
        var lowerEnemyId = lowerEnemy._id;
        for(var j = colNumber; j < Enemy.DEFAULT_ROWS * Enemy.COLUMNS; j += Enemy.COLUMNS) {
            for (var i = 0; i < army._enemies.length; i++) {
                if (army._enemies[i]._id === j)
                    lowerEnemyId = i;
            }
        }

        var lowerEnemy = this._enemies[lowerEnemyId];
        if( lowerEnemy == undefined) return;
        lowerEnemy.fire(bullet);
    },
    bulletsRender: function() {
        this._enemyBullets.forEach(function(bullet) {
            bullet.bulletFlying();
        });
    },

    //return array of army line, who will make the step
    getCurrentLineEnemies: function () {
        var self = this;
        var arr = this._enemies.filter(function (item) {
            return item._inLineNumberOf === self._whatLineMakeStep
            && item._status === Enemy.ENEMY_LIVE;
        });
        return arr;
    },
    changeMoveDirection: function() {
        this._isMoveRight = !this._isMoveRight;
    },
    isWin: function() {
      if(this._enemies.length == 0) youWin();
    },
    makeStepDown: function() {
        this._enemies.forEach(function (enemy) {
            Game.context.clearRect(enemy._x, enemy._y, enemy._width, enemy._height);
            enemy._y += Enemy.DOWN_SPEED;
            enemy.update();

            if(enemy._y + enemy._height > Game.FRONTIER) {
                gameOver();
            }
        });
    },
    enemyBulletsToStock: function() {//put used bullets back into stock
        for(var i = 0; i < army._enemyBullets.length; i++) {
            if( army._enemyBullets[i]._status === EnemyBullet.DEAD ) {
                army._enemyBullets[i].destroy();
            }
        }
    },
    bulletsReset: function() { //put all bullets back into stock (for end game)
        for (var i = 0; i < army._enemyBullets.length; i++) {
            army._enemyBullets[i].destroy();
        }
    },
    deleteDeadEnemyes: function () {
        for(var i in this._enemies) {
            if(this._enemies[i]._status === Enemy.ENEMY_DEAD ) {
                this._enemies[i].destroy();
                this._enemies.splice(i, 1);
            }
        }
    },
    removeDeadEnemyes: function () {
        this.deleteDeadEnemyes();
        this.isWin();
        this.enemyBulletsToStock();
    },
    makeStep: function() {
        var wantChangeMoveTrigger = false;
        var self = this;

        return function () {
            //make "delay" for reduce game speed on high fps
            if(!self.isCanMakeStep)return;
            self.isCanMakeStep = false;
            setTimeout(function () {
                self.isCanMakeStep = true;
            }, Enemy.STEP_TIME_DELAY);

            self._whatLineMakeStep--;
            if (self._whatLineMakeStep < 0) self._whatLineMakeStep = Enemy.ROWS - 1;

            var curLine = self.getCurrentLineEnemies();
            if( curLine.length == 0 )return;

            var clearX = 0,
                clearY = curLine[0]._y,
                clearW = Game.SCREEN_SIZE,
                clearH = curLine[0]._height;

            //INFO: can swap on canvas.width = canvas.width for some browsers (sush as Chrome)
            Game.context.clearRect(clearX, clearY, clearW, clearH);

            var newX;
            for (var i = 0; i < curLine.length; i++) {
                if (self._isMoveRight) {
                    newX = curLine[i]._x + curLine[i]._speed;
                    if (newX > Game.SCREEN_SIZE - curLine[i]._width) {
                        if (self._whatLineMakeStep == 0) {
                            wantChangeMoveTrigger = true;
                        }
                    }
                } else { //move to left
                    newX = curLine[i]._x - curLine[i]._speed;
                    if (newX < Unit.DEFAULT_SPACE) {
                        if (self._whatLineMakeStep == 0) {
                            wantChangeMoveTrigger = true;
                        }
                    }
                }
                curLine[i]._x = newX;
                curLine[i].update();
            }//end for

            if (wantChangeMoveTrigger) {
                //here we make test "need make down step and change move direction?"
                self._whatLineMakeStep = Enemy.ROWS;
                wantChangeMoveTrigger = false;
                self.changeMoveDirection();
                self.makeStepDown();
            }
            window.playStepSound();
        }
    }
};


///////////////////////////UTILS/////////////////////////////
//рисует красную линию-границу
function drawFrontier() {
    Game.context.beginPath();
    Game.context.moveTo(0, Game.FRONTIER);
    Game.context.lineTo(Game.SCREEN_SIZE, Game.FRONTIER);
    Game.context.strokeStyle = '#ffffff';
    Game.context.stroke();
}


/////////////////////////Init Game///////////////////////////
var armyMakeStep, playerGun, canvas;



function detectmob() {
    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    }
    else {
        return false;
    }
}

function detectPlatform() {
    setupCanvas();
    setCanvasSize();
    preloader();

    if(detectmob()) {//if this is mobile device
        Game.PLATFORM = Game.MOBILE_PLATFORM;
    } else {
        Game.PLATFORM = Game.DESKTOP_PLATFORM;
    }


    //start handlers
    if(Game.PLATFORM === Game.MOBILE_PLATFORM){
        console.log("mobile");
    } else {
        console.log("desktop");
    }
    if (Game.PLATFORM === Game.MOBILE_PLATFORM) {
        var el = document.getElementById("gameCanvas");
        el.addEventListener("touchstart", mobileGameStartHandler, false);
    } else {
        document.addEventListener("keydown", gameStartHandler);
    }

    //desktop
    function gameStartHandler(event) {
        if(event.keyCode === 32 ) {
            document.removeEventListener("keydown",gameStartHandler);
            init();
        }
    }
    //mobile
    function mobileGameStartHandler(event) {
        var el = document.getElementById("gameCanvas");
        el.removeEventListener("touchstart", mobileGameStartHandler);
        init();
    }
}

function setCanvasSize() {
    //set canvas size
    var wSize = window.innerWidth,
        hSize = window.innerHeight;
    var size = Math.min(wSize, hSize);
    Game.SCREEN_SIZE = canvas.width = canvas.height = Math.round( size );
    Game.FRONTIER = Game.SCREEN_SIZE - Game.SCREEN_SIZE / 10;
}

function setupCanvas() {
    canvas = document.getElementById("gameCanvas");
    if(canvas.getContext) {
        var cxt = canvas.getContext('2d');
        Game.context = cxt;
    } else {
        alert("Canvas не поддерживается данным браузером");
    }
}

function init() {
    console.log("init");

    var cxt = Game.context;

    //Init game objects
    Unit.DEFAULT_WIDTH = Math.round( Unit.DEFAULT_HEIGHT = Game.SCREEN_SIZE / 15 );
    Unit.DEFAULT_SPACE = Math.round( Unit.DEFAULT_WIDTH / 2 );

    //create enemies array (for army)
    var enemyes = [];
    for(var i = 0; i < Enemy.ROWS; i++) {
        for(var j = 0; j < Enemy.COLUMNS; j++) {
            enemyes[i*Enemy.COLUMNS + j] = new Enemy({
                id: (i*Enemy.COLUMNS + j),
                x: Math.round( j * Unit.DEFAULT_WIDTH + Unit.DEFAULT_SPACE ),
                y: Enemy.START_Y + Math.round( i * Unit.DEFAULT_HEIGHT + Unit.DEFAULT_SPACE ),
                type: Unit.ENEMY_TYPE,
                speed: Enemy.SPEED,
                inLineNumberOf: i,
                context: cxt
            });
        }
    }

    //create army of enemyes
    army._enemies = enemyes;
    armyMakeStep = army.makeStep();

    //create bullets of enemyes
    for(var i = 0; i < Enemy.MAX_ENEMY_BULLETS; i++) {
        army._enemyBullets.push(new EnemyBullet({
            x: -200,
            y: -200,
            type: Unit.ENEMY_BULLET_TYPE,
            id: i,
            context: cxt
        }));
    }

    //create player gun
    playerGun = new PlayerGun({
        x: Game.SCREEN_SIZE / 2,
        y: Game.SCREEN_SIZE - Game.SCREEN_SIZE/11,
        type: Unit.PLAYER_TYPE,
        context: cxt
    });

    //start game
    start();
}

function preloader() {
    var titleImage = new Image();
    titleImage.src = Unit.TITLE_SPRITE;
    Game.context.drawImage(titleImage,0, 0, Game.SCREEN_SIZE, Game.SCREEN_SIZE );
}

//onFrame
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();



function render(){
    army.removeDeadEnemyes();
    armyMakeStep();
    playerGun.bulletFlying();
    army.fire();
    army.bulletsRender();

    drawFrontier();
}

function inputHandlers() {
    playerGun.inputHandler();
}

var lastCalledTime;
var fps;
//main game cycle
function gameCycle() {
    //FPS
    if(!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
    }

    if( Game.STATUS === "PLAY") {
        inputHandlers();
        render();
        requestAnimFrame(gameCycle, canvas);
    }

    //FPS
    delta = (Date.now() - lastCalledTime)/1000;
    lastCalledTime = Date.now();
    fps = Math.round( 1/delta );
    document.getElementById("fps").innerHTML = fps;
};

//game over
function gameOver() {

    pause();
    window.playGameOverSound();

    //set new game level value and make game slower
    if( Game.WINS > 0) {
        Game.WINS--;
        document.getElementById("levelNumText").innerHTML = Game.WINS;

        Enemy.DEFAULT_STEP_TIME_DELAY += 20;
        if(Enemy.MAX_ENEMY_BULLETS > 2) Enemy.MAX_ENEMY_BULLETS--;

        if(Enemy.FIRE_TIME_DELAY > 100 ) Enemy.FIRE_TIME_DELAY += 100;
    }

    setTimeout(function(){
        Game.context.clearRect(0, 0, Game.SCREEN_SIZE, Game.SCREEN_SIZE);
        Game.STATUS = "GAME_OVER";
        clearMemory();

        var gameOverImage = new Image();
        gameOverImage.src = Unit.GAME_OVER_SPRITE;
        Game.context.drawImage(gameOverImage,0, 0, Game.SCREEN_SIZE, Game.SCREEN_SIZE );

        setTimeout(detectPlatform, 3000);
    },300);
}



function youWin() {

    pause();
    window.playWinSound();

    Game.WINS++;
    document.getElementById("levelNumText").innerHTML = Game.WINS;

    //make game faster
    if( Enemy.DEFAULT_STEP_TIME_DELAY > 20 ) Enemy.DEFAULT_STEP_TIME_DELAY -= 20;
    if(Enemy.FIRE_TIME_DELAY > 100 ) Enemy.FIRE_TIME_DELAY -= 100;
    Enemy.MAX_ENEMY_BULLETS++;

    setTimeout(function(){
        Game.context.clearRect(0, 0, Game.SCREEN_SIZE, Game.SCREEN_SIZE);
        Game.STATUS = "WIN";
        clearMemory();

        var youWinImage = new Image();
        youWinImage.src = Unit.YOU_WIN_SPRITE;
        Game.context.drawImage(youWinImage,0, 0, Game.SCREEN_SIZE, Game.SCREEN_SIZE );

        setTimeout(detectPlatform, 3000);
    },300);
}

function clearMemory() {
    Enemy.ROWS  = Enemy.DEFAULT_ROWS;
    army._enemies = [];
    army._enemyBullets = [];
    army.bulletsReset();
    playerGun = null;
}


function pause() {
    Game.STATUS = "PAUSE";
}
function play() {
    start();
}
function start() {
    Enemy.STEP_TIME_DELAY = Enemy.DEFAULT_STEP_TIME_DELAY;
    Game.context.clearRect(0, 0, Game.SCREEN_SIZE, Game.SCREEN_SIZE);
    Game.STATUS = "PLAY";
    gameCycle();
}