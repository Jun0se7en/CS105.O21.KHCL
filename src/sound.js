export default class Sound {
    constructor(source) {
        this.source = source;
        this.menuaudio = document.createElement('audio');
        this.menuaudio_src = document.createElement('source');
        this.volumeBtn = document.getElementById("volumeBtn");
        this.volumeUp = true;
        this.gameaudio = document.createElement('audio');
        this.gameaudio_src = document.createElement('source');
    }

    menu_load(){
        // Add menu audio
        this.volumeBtn = document.getElementById("volumeBtn");
        this.menuaudio_src.src = this.source;
        this.menuaudio_src.type = 'audio/mpeg';
        this.menuaudio.appendChild(this.menuaudio_src);
        this.menuaudio.volume = 0.2;
        this.menuaudio.loop = true;
        this.menuaudio.play();

        // Control Volume of the Game
        const self = this;
        this.volumeBtn.addEventListener('click', function() {
            self.volumeUp = !self.volumeUp;
            let child = self.volumeBtn.lastElementChild;  
            while (child) { 
                self.volumeBtn.removeChild(child); 
                child = self.volumeBtn.lastElementChild; 
            };
            if (self.volumeUp == true){
                var button = document.createElement('i');
                button.className = "fa fa-volume-up";
                self.volumeBtn.appendChild(button);
                self.menuaudio.play();
            }
            else{
                var button = document.createElement('i');
                button.className = "fa fa-volume-off";
                self.volumeBtn.appendChild(button);
                self.menuaudio.pause();
            }});
    }

    game_load(){
        this.gameaudio_src.src = this.source;
        this.gameaudio_src.type = 'audio/mpeg';
        this.gameaudio.appendChild(this.gameaudio_src);
        this.gameaudio.volume = 0.2;
        this.gameaudio.loop = true;
        this.gameaudio.play();
    }
}