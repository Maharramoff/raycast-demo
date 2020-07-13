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
const TILE_SIZE = 40;
const WALL_COLOR = '#7f7f7f';
const SPACE_COLOR = '#e5e5e5';
const WALL_BORDER_COLOR = '#4c4c4c';
const SCREEN_WIDTH = TILE_SIZE * MAP_GRID[0].length;
const SCREEN_HEIGHT = TILE_SIZE * MAP_GRID.length;
const MAP_OFFSET = SCREEN_WIDTH * 2;

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
const FIELD_OF_VIEW = 60 * (Math.PI / 180);
const FIELD_OF_VIEW_COLOR = 'rgba(242, 199, 114, .3)';

const WALL_STRIP_WIDTH = 4;
const RAYS_COUNT = SCREEN_WIDTH / WALL_STRIP_WIDTH;