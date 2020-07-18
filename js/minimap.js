class MiniMap
{
    constructor(mapData, width, height, scale, wallColor, spaceColor, wallBorderColor)
    {
        this.mapCanvas = new Canvas(SCREEN_WIDTH + MAP_OFFSET, SCREEN_HEIGHT);
        this.ctx = this.mapCanvas.context;
        this.spaceColor = spaceColor;
        this.width = width;
        this.height = height;
        this.grid = mapData;
        this.scale = scale;
        this.wallColor = wallColor;
        this.wallBorderColor = wallBorderColor;
        this.completed = false;
    }

    draw()
    {
        if (this.completed) return;

        this.ctx.fillStyle = this.spaceColor;
        this.ctx.fillRect(MAP_OFFSET, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const tile = this.grid[y][x];

                if (tile === 1)
                {
                    this.ctx.fillStyle = this.wallColor;
                    this.ctx.fillRect(
                      x * this.scale + MAP_OFFSET,
                      y * this.scale,
                      this.scale,
                      this.scale
                    );
                    this.ctx.strokeStyle = this.wallBorderColor;
                    this.ctx.strokeRect(
                      x * this.scale + MAP_OFFSET,
                      y * this.scale,
                      this.scale,
                      this.scale)
                    this.ctx.stroke();
                }
            }
        }

        this.completed = true;
    }
}