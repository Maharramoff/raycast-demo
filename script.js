class Helper
{
    static _timestamp()
    {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }
}

class Canvas
{
    constructor(width, height)
    {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
    }
}

class Raycast
{
    constructor(canvas)
    {
        this.running = false;
        this.fps = 60;
        this.step = 1 / this.fps;
        this.now = 0;
        this.lastTime = Helper._timestamp();
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.ctx = canvas.context;
    }

    start()
    {
        if (this.running)
        {
            return false;
        }

        this.running = true;
        this._animate();
    }

    _animate()
    {

        this.now = Helper._timestamp();
        this.deltaTime = Math.min(1, (this.now - this.lastTime) / 1000);
        this.elapsedTime += this.deltaTime;
        while (this.elapsedTime > this.step)
        {
            this._update(this.step);
            this.elapsedTime -= this.step;
        }
        this._draw();
        this.lastTime = this.now;
        requestAnimationFrame(() => this._animate());
    }

    _update(dt)
    {
    }

    _draw()
    {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

const canvas = new Canvas(RAYCAST_MAP[0].length * RAYCAST_MINI_MAP_SCALE, RAYCAST_MAP.length * RAYCAST_MINI_MAP_SCALE);
new Raycast(canvas).start();