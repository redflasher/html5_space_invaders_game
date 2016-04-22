;(function() {
    var context;
    var bufferLoader;
    var _bufferList;
    var _buffers = [];
    var that = this;

    function loadBeforePlay() {
        console.log("Sound: loadAndPlay");
        try {
            context = new AudioContext();
            window.playStepSound = playStep;
            window.playPlayerGunSound = playPlayerGun;
            window.playEnemyGunSound = playEnemyGun;
            window.playBulletBulletSound = playBulletBullet;
            window.playEnemyDeadSound = playEnemyDead;
            window.playPlayerGunDeadSound = playPlayerGunDead;
            window.playWinSound = playWin;
            window.playGameOverSound = playGameOver;
        }
        catch(e) {
            this.playSound = nullFunc;
            window.playStepSound = nullFunc;
            window.playPlayerGunSound = nullFunc;
            window.playEnemyGunSound = nullFunc;
            window.playBulletBulletSound = nullFunc;
            window.playEnemyDeadSound = nullFunc;
            window.playPlayerGunDeadSound = nullFunc;
            window.playWinSound = nullFunc;
            window.playGameOverSound = nullFunc;
            console.log("Web Audio API is not supported in this browser");
            return;
        }

        bufferLoader = new BufferLoader(
            context,
            [
                "snd/37.wav",
                "snd/43.wav",
                "snd/16.wav",
                "snd/23.wav",
                "snd/25.wav",
                "snd/17.wav",
                "snd/win.mp3",
                "snd/gameover.mp3"
            ],
            finishedLoading
        );

        bufferLoader.load();
    }

    function finishedLoading(bufferList) {
        that._bufferList = bufferList;
    }

    function playSound(num) {
        var self = this;

        if(!that._bufferList) return;

        this.snd = context.createBufferSource();
        this.snd.buffer = that._bufferList[num];
        this.snd.connect(context.destination);

        if(this.snd)this.snd.start(0);

        this.snd.onended = function () {
            self.snd = null;
        };
    }

    function playStep(){
        playSound(0);
    }

    function playPlayerGun(){
        playSound(1);
    }

    function playEnemyGun(){
        playSound(2);
    }

    function playBulletBullet(){
        playSound(3);
    }

    function playEnemyDead(){
        playSound(4);
    }

    function playPlayerGunDead(){
        playSound(5);
    }

    function playWin(){
        playSound(6);
    }

    function playGameOver(){
        playSound(7);
    }

    //Init
    loadBeforePlay();
    // window.playStepSound = playStep;
    // window.playPlayerGunSound = playPlayerGun;
    // window.playEnemyGunSound = playEnemyGun;
    // window.playBulletBulletSound = playBulletBullet;
    // window.playEnemyDeadSound = playEnemyDead;
    // window.playPlayerGunDeadSound = playPlayerGunDead;
    // window.playWinSound = playWin;
    // window.playGameOverSound = playGameOver;

    function nullFunc() {}

})();