export default class Lighting {
    constructor() {
        this.light = document.createElement('div');
        this.light.className = 'light';
        this.light.style.position = 'absolute';
        this.light.style.width = '100%';
        this.light.style.height = '100%';
        this.light.style.background = 'rgba(0, 0, 0, 0.8)';
        this.light.style.zIndex = '100';
        this.light.style.display = 'none';
        document.body.appendChild(this.light);
    }

    turnOn() {
        this.light.style.display = 'block';
    }

    turnOff() {
        this.light.style.display = 'none';
    }
} 