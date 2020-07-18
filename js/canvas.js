class Canvas
{
    constructor(width, height)
    {
        this.canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        document.body.append(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.context.scale(dpr, dpr);
    }
}