const MAP_GRID = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];
const TILE_SIZE = 24;
const WALL_COLOR = '#7f7f7f';
const SPACE_COLOR = '#ffffff';
const SCREEN_WIDTH = TILE_SIZE * MAP_GRID[0].length;
const SCREEN_HEIGHT = TILE_SIZE * MAP_GRID.length;

// Player
const KEY_CODES = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

const EVENTS = {
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
};