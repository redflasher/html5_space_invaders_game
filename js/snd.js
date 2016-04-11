;(function() {
    var context;
    var bufferLoader;
    var _bufferList;
    var _buffers = [];

    function loadBeforePlay() {
        console.log("Sound: loadAndPlay");
        try {
            context = new AudioContext();
        }
        catch(e) {
            alert("Web Audio API is not supported in this browser");
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
        _bufferList = bufferList;
    }

    function playSound(num) {
        var self = this;
        this.snd = context.createBufferSource();
        this.snd.buffer = _bufferList[num];
        this.snd.connect(context.destination);

        this.snd.start(0);

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
    window.playStepSound = playStep;
    window.playPlayerGunSound = playPlayerGun;
    window.playEnemyGunSound = playEnemyGun;
    window.playBulletBulletSound = playBulletBullet;
    window.playEnemyDeadSound = playEnemyDead;
    window.playPlayerGunDeadSound = playPlayerGunDead;
    window.playWinSound = playWin;
    window.playGameOverSound = playGameOver;

})();