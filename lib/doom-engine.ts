// DOOM-style Raycasting Engine - Enhanced Version

export interface Player {
  x: number;
  y: number;
  angle: number;
  health: number;
  maxHealth: number;
  armor: number;
  ammo: Record<AmmoType, number>;
  weapon: WeaponType;
  bobPhase: number;
  isMoving: boolean;
  isMeleeing: boolean;
  meleeFrame: number;
}

export enum WeaponType {
  FIST = 0,
  CHAINSAW = 1,
  PISTOL = 2,
  SHOTGUN = 3,
  CHAINGUN = 4,
}

export enum AmmoType {
  BULLETS = 'bullets',
  SHELLS = 'shells',
}

export interface WeaponConfig {
  name: string;
  damage: number;
  spread: number;
  pellets: number;
  fireRate: number;
  ammoType: AmmoType | null;
  ammoCost: number;
  range: number;
  isMelee: boolean;
}

export const WEAPON_CONFIG: Record<WeaponType, WeaponConfig> = {
  [WeaponType.FIST]: {
    name: 'Fist',
    damage: 20,
    spread: 0,
    pellets: 1,
    fireRate: 400,
    ammoType: null,
    ammoCost: 0,
    range: 2,
    isMelee: true,
  },
  [WeaponType.CHAINSAW]: {
    name: 'Chainsaw',
    damage: 40,
    spread: 0,
    pellets: 1,
    fireRate: 100,
    ammoType: null,
    ammoCost: 0,
    range: 2.5,
    isMelee: true,
  },
  [WeaponType.PISTOL]: {
    name: 'Pistol',
    damage: 15,
    spread: 0.02,
    pellets: 1,
    fireRate: 300,
    ammoType: AmmoType.BULLETS,
    ammoCost: 1,
    range: 100,
    isMelee: false,
  },
  [WeaponType.SHOTGUN]: {
    name: 'Shotgun',
    damage: 15,
    spread: 0.1,
    pellets: 7,
    fireRate: 800,
    ammoType: AmmoType.SHELLS,
    ammoCost: 1,
    range: 100,
    isMelee: false,
  },
  [WeaponType.CHAINGUN]: {
    name: 'Chaingun',
    damage: 12,
    spread: 0.04,
    pellets: 1,
    fireRate: 80,
    ammoType: AmmoType.BULLETS,
    ammoCost: 1,
    range: 100,
    isMelee: false,
  },
};

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  state: 'idle' | 'chasing' | 'attacking' | 'hurt' | 'dead' | 'melee';
  animFrame: number;
  lastAttack: number;
  attackCooldown: number;
  sightRange: number;
  attackRange: number;
  meleeRange: number;
  isMelee: boolean;
}

export enum EnemyType {
  IMP = 0,
  DEMON = 1,
  SOLDIER = 2,
  CACODEMON = 3,
  BARON = 4,
  ZOMBIE = 5,
  HELLKNIGHT = 6,
  CYBERDEMON = 7,
}

export const ENEMY_CONFIG: Record<EnemyType, {
  name: string;
  health: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  sightRange: number;
  attackRange: number;
  meleeRange: number;
  isMelee: boolean;
  color: string;
  size: number;
}> = {
  [EnemyType.IMP]: {
    name: 'Imp',
    health: 60,
    speed: 0.025,
    damage: 10,
    attackCooldown: 1200,
    sightRange: 15,
    attackRange: 8,
    meleeRange: 1.5,
    isMelee: false,
    color: '#8B4513',
    size: 0.5,
  },
  [EnemyType.DEMON]: {
    name: 'Demon',
    health: 150,
    speed: 0.045,
    damage: 30,
    attackCooldown: 800,
    sightRange: 12,
    attackRange: 1.8,
    meleeRange: 1.8,
    isMelee: true,
    color: '#FF1493',
    size: 0.7,
  },
  [EnemyType.SOLDIER]: {
    name: 'Soldier',
    health: 30,
    speed: 0.018,
    damage: 12,
    attackCooldown: 1500,
    sightRange: 20,
    attackRange: 15,
    meleeRange: 1.2,
    isMelee: false,
    color: '#556B2F',
    size: 0.5,
  },
  [EnemyType.CACODEMON]: {
    name: 'Cacodemon',
    health: 400,
    speed: 0.022,
    damage: 25,
    attackCooldown: 2000,
    sightRange: 18,
    attackRange: 10,
    meleeRange: 2,
    isMelee: false,
    color: '#DC143C',
    size: 0.8,
  },
  [EnemyType.BARON]: {
    name: 'Baron of Hell',
    health: 1000,
    speed: 0.015,
    damage: 45,
    attackCooldown: 2500,
    sightRange: 25,
    attackRange: 12,
    meleeRange: 2.5,
    isMelee: false,
    color: '#228B22',
    size: 1.0,
  },
  [EnemyType.ZOMBIE]: {
    name: 'Zombie',
    health: 20,
    speed: 0.012,
    damage: 8,
    attackCooldown: 1000,
    sightRange: 10,
    attackRange: 1.5,
    meleeRange: 1.5,
    isMelee: true,
    color: '#4a4a2a',
    size: 0.45,
  },
  [EnemyType.HELLKNIGHT]: {
    name: 'Hell Knight',
    health: 500,
    speed: 0.028,
    damage: 35,
    attackCooldown: 1800,
    sightRange: 20,
    attackRange: 10,
    meleeRange: 2.2,
    isMelee: false,
    color: '#8B4513',
    size: 0.85,
  },
  [EnemyType.CYBERDEMON]: {
    name: 'Cyberdemon',
    health: 4000,
    speed: 0.01,
    damage: 80,
    attackCooldown: 600,
    sightRange: 30,
    attackRange: 25,
    meleeRange: 3,
    isMelee: false,
    color: '#8B0000',
    size: 1.4,
  },
};

export interface Projectile {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  damage: number;
  fromEnemy: boolean;
  color: string;
  size: number;
}

export enum PickupType {
  HEALTH = 0,
  ARMOR = 1,
  AMMO_BULLETS = 2,
  AMMO_SHELLS = 3,
  WEAPON_SHOTGUN = 4,
  WEAPON_CHAINGUN = 5,
  WEAPON_CHAINSAW = 6,
  MEGAHEALTH = 7,
}

export interface Pickup {
  id: number;
  x: number;
  y: number;
  type: PickupType;
  collected: boolean;
}

export const PICKUP_CONFIG: Record<PickupType, {
  name: string;
  color: string;
  value: number;
}> = {
  [PickupType.HEALTH]: { name: 'Health', color: '#00ff00', value: 25 },
  [PickupType.ARMOR]: { name: 'Armor', color: '#00aaff', value: 25 },
  [PickupType.AMMO_BULLETS]: { name: 'Bullets', color: '#ffaa00', value: 20 },
  [PickupType.AMMO_SHELLS]: { name: 'Shells', color: '#ff6600', value: 4 },
  [PickupType.WEAPON_SHOTGUN]: { name: 'Shotgun', color: '#888888', value: 0 },
  [PickupType.WEAPON_CHAINGUN]: { name: 'Chaingun', color: '#666666', value: 0 },
  [PickupType.WEAPON_CHAINSAW]: { name: 'Chainsaw', color: '#ff0000', value: 0 },
  [PickupType.MEGAHEALTH]: { name: 'Megahealth', color: '#0000ff', value: 100 },
};

export interface Level {
  map: number[][];
  enemies: Omit<Enemy, 'id'>[];
  pickups: Omit<Pickup, 'id'>[];
  startX: number;
  startY: number;
  startAngle: number;
  name: string;
  exitX: number;
  exitY: number;
}

export const WALL_COLORS: Record<number, { dark: string; light: string }> = {
  1: { dark: '#4a0000', light: '#6a0000' },
  2: { dark: '#1a1a3a', light: '#2a2a5a' },
  3: { dark: '#3a2a1a', light: '#5a4a2a' },
  4: { dark: '#2a2a2a', light: '#4a4a4a' },
  5: { dark: '#1a3a1a', light: '#2a5a2a' },
  9: { dark: '#ffaa00', light: '#ffcc00' }, // Exit
};

// Level 1 - Entry
const LEVEL_1_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
  [1, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 9, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Level 2 - Warehouse
const LEVEL_2_MAP: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 2],
  [2, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 2],
  [2, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4, 4, 0, 2],
  [2, 0, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4, 4, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

// Level 3 - Hell
const LEVEL_3_MAP: number[][] = [
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 5],
  [5, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 5],
  [5, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 5],
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
];

function createEnemy(type: EnemyType, x: number, y: number): Omit<Enemy, 'id'> {
  const config = ENEMY_CONFIG[type];
  return {
    type,
    x,
    y,
    health: config.health,
    maxHealth: config.health,
    speed: config.speed,
    damage: config.damage,
    state: 'idle',
    animFrame: 0,
    lastAttack: 0,
    attackCooldown: config.attackCooldown,
    sightRange: config.sightRange,
    attackRange: config.attackRange,
    meleeRange: config.meleeRange,
    isMelee: config.isMelee,
  };
}

export const LEVELS: Level[] = [
  {
    name: 'Level 1: Entry',
    map: LEVEL_1_MAP,
    startX: 1.5,
    startY: 1.5,
    startAngle: 0,
    exitX: 18,
    exitY: 12,
    enemies: [
      createEnemy(EnemyType.ZOMBIE, 5, 5),
      createEnemy(EnemyType.ZOMBIE, 15, 5),
      createEnemy(EnemyType.IMP, 10, 7),
      createEnemy(EnemyType.IMP, 16, 10),
      createEnemy(EnemyType.SOLDIER, 5, 11),
      createEnemy(EnemyType.DEMON, 10, 10),
    ],
    pickups: [
      { x: 8, y: 2, type: PickupType.AMMO_BULLETS, collected: false },
      { x: 10, y: 8, type: PickupType.HEALTH, collected: false },
      { x: 15, y: 12, type: PickupType.WEAPON_SHOTGUN, collected: false },
      { x: 5, y: 8, type: PickupType.AMMO_SHELLS, collected: false },
    ],
  },
  {
    name: 'Level 2: Warehouse',
    map: LEVEL_2_MAP,
    startX: 1.5,
    startY: 1.5,
    startAngle: 0,
    exitX: 20,
    exitY: 12,
    enemies: [
      createEnemy(EnemyType.SOLDIER, 5, 5),
      createEnemy(EnemyType.SOLDIER, 15, 5),
      createEnemy(EnemyType.SOLDIER, 10, 8),
      createEnemy(EnemyType.IMP, 18, 5),
      createEnemy(EnemyType.IMP, 5, 10),
      createEnemy(EnemyType.DEMON, 12, 5),
      createEnemy(EnemyType.DEMON, 8, 10),
      createEnemy(EnemyType.CACODEMON, 10, 10),
      createEnemy(EnemyType.HELLKNIGHT, 15, 10),
    ],
    pickups: [
      { x: 10, y: 5, type: PickupType.HEALTH, collected: false },
      { x: 5, y: 8, type: PickupType.AMMO_BULLETS, collected: false },
      { x: 15, y: 8, type: PickupType.AMMO_SHELLS, collected: false },
      { x: 10, y: 12, type: PickupType.WEAPON_CHAINGUN, collected: false },
      { x: 18, y: 10, type: PickupType.ARMOR, collected: false },
      { x: 3, y: 12, type: PickupType.MEGAHEALTH, collected: false },
    ],
  },
  {
    name: 'Level 3: Hell',
    map: LEVEL_3_MAP,
    startX: 1.5,
    startY: 1.5,
    startAngle: 0,
    exitX: 22,
    exitY: 10,
    enemies: [
      createEnemy(EnemyType.IMP, 6, 5),
      createEnemy(EnemyType.IMP, 18, 5),
      createEnemy(EnemyType.IMP, 6, 8),
      createEnemy(EnemyType.IMP, 18, 8),
      createEnemy(EnemyType.DEMON, 12, 3),
      createEnemy(EnemyType.DEMON, 12, 9),
      createEnemy(EnemyType.CACODEMON, 8, 6),
      createEnemy(EnemyType.CACODEMON, 16, 6),
      createEnemy(EnemyType.HELLKNIGHT, 10, 6),
      createEnemy(EnemyType.HELLKNIGHT, 14, 6),
      createEnemy(EnemyType.BARON, 12, 6),
      createEnemy(EnemyType.CYBERDEMON, 20, 6),
    ],
    pickups: [
      { x: 4, y: 4, type: PickupType.MEGAHEALTH, collected: false },
      { x: 20, y: 4, type: PickupType.MEGAHEALTH, collected: false },
      { x: 12, y: 2, type: PickupType.AMMO_BULLETS, collected: false },
      { x: 12, y: 10, type: PickupType.AMMO_SHELLS, collected: false },
      { x: 8, y: 9, type: PickupType.ARMOR, collected: false },
      { x: 16, y: 9, type: PickupType.ARMOR, collected: false },
      { x: 2, y: 10, type: PickupType.WEAPON_CHAINSAW, collected: false },
    ],
  },
];

// Raycasting functions
export function castRay(
  map: number[][],
  playerX: number,
  playerY: number,
  rayAngle: number
): { distance: number; wallType: number; side: number; hitX: number; hitY: number } {
  const rayDirX = Math.cos(rayAngle);
  const rayDirY = Math.sin(rayAngle);

  let mapX = Math.floor(playerX);
  let mapY = Math.floor(playerY);

  const deltaDistX = Math.abs(1 / rayDirX);
  const deltaDistY = Math.abs(1 / rayDirY);

  let stepX: number, stepY: number;
  let sideDistX: number, sideDistY: number;

  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (playerX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1.0 - playerX) * deltaDistX;
  }

  if (rayDirY < 0) {
    stepY = -1;
    sideDistY = (playerY - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1.0 - playerY) * deltaDistY;
  }

  let hit = false;
  let side = 0;
  let iterations = 0;
  const maxIterations = 64;

  while (!hit && iterations < maxIterations) {
    iterations++;
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
      if (map[mapY][mapX] > 0) hit = true;
    } else {
      hit = true;
    }
  }

  let perpWallDist: number;
  if (side === 0) {
    perpWallDist = sideDistX - deltaDistX;
  } else {
    perpWallDist = sideDistY - deltaDistY;
  }

  const hitX = playerX + perpWallDist * rayDirX;
  const hitY = playerY + perpWallDist * rayDirY;

  const wallType = mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length 
    ? map[mapY][mapX] 
    : 1;

  return { distance: Math.max(perpWallDist, 0.1), wallType, side, hitX, hitY };
}

export function checkCollision(map: number[][], x: number, y: number, radius = 0.3): boolean {
  const checkPoints = [
    { x: x - radius, y: y - radius },
    { x: x + radius, y: y - radius },
    { x: x - radius, y: y + radius },
    { x: x + radius, y: y + radius },
    { x, y: y - radius },
    { x, y: y + radius },
    { x: x - radius, y },
    { x: x + radius, y },
  ];

  for (const point of checkPoints) {
    const mapX = Math.floor(point.x);
    const mapY = Math.floor(point.y);
    if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
      if (map[mapY][mapX] > 0 && map[mapY][mapX] !== 9) return true;
    }
  }
  return false;
}

export function hasLineOfSight(
  map: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(distance * 8);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);

    if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
      if (map[mapY][mapX] > 0 && map[mapY][mapX] !== 9) return false;
    }
  }
  return true;
}

export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}
