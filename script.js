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

class Player
{
    constructor(ctx, x, y, speed, rotationSpeed)
    {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.rotationAngle = 0;
        this.direction = 0;
        this.turn = 0;
        this.ctx = ctx;
        this.radius = 2.5;
    }

    update(dt)
    {
        this.rotationAngle += this.turn * this.rotationSpeed * Math.PI / 180 * dt;
        this.x += Math.cos(this.rotationAngle) * this.direction * this.speed * dt;
        this.y += Math.sin(this.rotationAngle) * this.direction * this.speed * dt;
    }

    draw()
    {
        this.ctx.fillStyle = '#fe0807';
        this.ctx.beginPath();
        this.ctx.arc(this.x * RAYCAST_MINI_MAP_SCALE, this.y * RAYCAST_MINI_MAP_SCALE, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}

class MiniMap
{
    constructor(ctx, mapData, width, height, scale, wallColor)
    {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.data = mapData;
        this.scale = scale;
        this.wallColor = wallColor;
    }

    draw()
    {
        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const cell = this.data[y][x];

                if (cell === 1)
                {
                    this.ctx.fillStyle = this.wallColor;
                    this.ctx.fillRect(
                      x * this.scale,
                      y * this.scale,
                      this.scale,
                      this.scale
                    );
                }
            }
        }
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
        this.miniMap = new MiniMap(
          this.ctx,
          RAYCAST_MAP, RAYCAST_MAP[0].length,
          RAYCAST_MAP.length,
          RAYCAST_MINI_MAP_SCALE,
          RAYCAST_MINI_MAP_WALL_COLOR
        );
        this.player = new Player(this.ctx, 5, 5, 1, 300);
    }

    start()
    {
        if (this.running)
        {
            return false;
        }

        this.running = true;
        this._startListening();
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
        this.player.update(dt);
    }

    handleEvent(e)
    {
        return (function (evtType, events)
        {
            switch (evtType)
            {
                case events.KEYDOWN:
                    this.onKeyDown(e);
                    break;
                case events.KEYUP:
                    this.onKeyUp(e);
                    break;
            }
        }.bind(this))(e.type, EVENTS);
    }

    _startListening()
    {
        document.addEventListener(EVENTS.KEYDOWN, this);
        document.addEventListener(EVENTS.KEYUP, this);
    }

    onKeyDown(e)
    {
        switch (e.keyCode)
        {
            case KEY_CODES.UP:
                this.player.direction = 1;
                break;
            case KEY_CODES.DOWN:
                this.player.direction = -1;
                break;
            case KEY_CODES.LEFT:
                this.player.turn = -1;
                break;
            case KEY_CODES.RIGHT:
                this.player.turn = 1;
                break;
        }
    }

    onKeyUp(e)
    {
        switch (e.keyCode)
        {
            case KEY_CODES.UP:
            case KEY_CODES.DOWN:
                this.player.direction = 0;
                break;
            case KEY_CODES.LEFT:
            case KEY_CODES.RIGHT:
                this.player.turn = 0;
                break;
        }
    }

    _draw()
    {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.miniMap.draw();
        this.player.draw();
    }
}

const canvas = new Canvas(RAYCAST_MAP[0].length * RAYCAST_MINI_MAP_SCALE, RAYCAST_MAP.length * RAYCAST_MINI_MAP_SCALE);
new Raycast(canvas).start();