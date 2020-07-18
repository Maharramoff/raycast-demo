class Player
{
    constructor(x, y, speed, rotationSpeed)
    {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed * (Math.PI / 180);
        this.rotationAngle = 0;
        this.moveDirection = 0;
        this.turnDirection = 0;
        this.playerCanvas = new Canvas(SCREEN_WIDTH + MAP_OFFSET, SCREEN_HEIGHT)
        this.ctx = this.playerCanvas.context;
        this.ctx.fillStyle = '#fe0807';
        this.radius = 0.125 * TILE_SIZE;
    }

    update()
    {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        const newX = this.x + Math.cos(this.rotationAngle) * this.moveDirection * this.speed;
        const newY = this.y + Math.sin(this.rotationAngle) * this.moveDirection * this.speed;

        if (!this.collision(newX, newY))
        {
            this.x = newX;
            this.y = newY;
        }
    }

    draw()
    {
        this.ctx.clearRect(MAP_OFFSET, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.ctx.beginPath();
        this.ctx.arc(this.x + MAP_OFFSET, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    collision(newX, newY)
    {
        return (MAP_GRID[Math.floor((newY + this.radius) / TILE_SIZE)][Math.floor((newX + this.radius) / TILE_SIZE)] !== 0) ||
          (MAP_GRID[Math.floor((newY - this.radius) / TILE_SIZE)][Math.floor((newX - this.radius) / TILE_SIZE)] !== 0)
    }
}