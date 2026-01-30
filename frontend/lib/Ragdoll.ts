// Ragdoll Physics System for Enemy Deaths
import { type Enemy, EnemyType, ENEMY_CONFIG } from "./fps-engine";

export type RagdollPartType = 'head' | 'torso' | 'arm_l' | 'arm_r' | 'leg_l' | 'leg_r';

export interface RagdollPart {
    id: number;
    x: number;
    y: number;
    z: number; // Height above ground (0 = ground level)
    vx: number;
    vy: number;
    vz: number;
    rotation: number;
    rotationSpeed: number;
    type: RagdollPartType;
    color: string;
    size: number;
    lifetime: number;
    maxLifetime: number;
    enemyType: EnemyType;
    onGround: boolean;
}

const GRAVITY = 0.015;
const BOUNCE_DAMPENING = 0.4;
const FLOOR_FRICTION = 0.92;
const MAX_LIFETIME = 180; // ~3 seconds at 60fps

const ENEMY_COLORS: Record<EnemyType, string> = {
    [EnemyType.IMP]: "#8B4513",
    [EnemyType.DEMON]: "#FF1493",
    [EnemyType.SOLDIER]: "#556B2F",
    [EnemyType.CACODEMON]: "#DC143C",
    [EnemyType.BARON]: "#228B22",
    [EnemyType.ZOMBIE]: "#4a4a2a",
    [EnemyType.HELLKNIGHT]: "#8B7355",
    [EnemyType.CYBERDEMON]: "#8B0000",
};

let partIdCounter = 0;

export class RagdollManager {
    private parts: RagdollPart[] = [];

    spawnRagdoll(enemy: Enemy, playerX: number, playerY: number, multiplier: number = 1): void {
        const config = ENEMY_CONFIG[enemy.type];
        const baseColor = ENEMY_COLORS[enemy.type];
        const baseSize = config.size * 0.3;

        // Calculate direction away from player
        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dirX = dist > 0 ? dx / dist : 0;
        const dirY = dist > 0 ? dy / dist : 0;

        // Base velocity from impact
        const impactSpeed = 0.08 + Math.random() * 0.04;

        const partTypes: RagdollPartType[] = ['head', 'torso', 'arm_l', 'arm_r', 'leg_l', 'leg_r'];

        // Spawn multiple copies based on multiplier
        for (let m = 0; m < multiplier; m++) {
            for (const partType of partTypes) {
                const spread = 0.3 + m * 0.1; // Increase spread with multiplier
                const offsetX = (Math.random() - 0.5) * spread;
                const offsetY = (Math.random() - 0.5) * spread;

                // Parts start at different heights
                let startZ = 0.5;
                let size = baseSize;

                switch (partType) {
                    case 'head':
                        startZ = 0.9;
                        size = baseSize * 0.7;
                        break;
                    case 'torso':
                        startZ = 0.6;
                        size = baseSize * 1.2;
                        break;
                    case 'arm_l':
                    case 'arm_r':
                        startZ = 0.5;
                        size = baseSize * 0.5;
                        break;
                    case 'leg_l':
                    case 'leg_r':
                        startZ = 0.3;
                        size = baseSize * 0.6;
                        break;
                }

                const part: RagdollPart = {
                    id: partIdCounter++,
                    x: enemy.x + offsetX,
                    y: enemy.y + offsetY,
                    z: startZ + Math.random() * 0.2,
                    vx: dirX * impactSpeed + (Math.random() - 0.5) * 0.08,
                    vy: dirY * impactSpeed + (Math.random() - 0.5) * 0.08,
                    vz: 0.08 + Math.random() * 0.08, // Initial upward velocity
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.4,
                    type: partType,
                    color: baseColor,
                    size: size * (0.8 + Math.random() * 0.4), // Vary sizes
                    lifetime: 0,
                    maxLifetime: MAX_LIFETIME + Math.random() * 60,
                    enemyType: enemy.type,
                    onGround: false,
                };

                this.parts.push(part);
            }
        }
    }

    update(dt: number, autoClear: boolean = true): void {
        const dtFactor = dt / 16.67; // Normalize to 60fps

        this.parts = this.parts.filter(part => {
            if (autoClear) {
                part.lifetime += dtFactor;
                if (part.lifetime >= part.maxLifetime) {
                    return false; // Remove expired parts
                }
            }

            if (!part.onGround) {
                // Apply gravity
                part.vz -= GRAVITY * dtFactor;

                // Update position
                part.x += part.vx * dtFactor;
                part.y += part.vy * dtFactor;
                part.z += part.vz * dtFactor;

                // Check floor collision
                if (part.z <= 0) {
                    part.z = 0;
                    part.vz = -part.vz * BOUNCE_DAMPENING;

                    // If bounce is too small, stop bouncing
                    if (Math.abs(part.vz) < 0.01) {
                        part.vz = 0;
                        part.onGround = true;
                    }

                    // Apply friction on bounce
                    part.vx *= FLOOR_FRICTION;
                    part.vy *= FLOOR_FRICTION;
                    part.rotationSpeed *= FLOOR_FRICTION;
                }
            } else {
                // On ground - apply friction
                part.vx *= FLOOR_FRICTION;
                part.vy *= FLOOR_FRICTION;
                part.x += part.vx * dtFactor;
                part.y += part.vy * dtFactor;

                // Stop moving if very slow
                if (Math.abs(part.vx) < 0.001 && Math.abs(part.vy) < 0.001) {
                    part.vx = 0;
                    part.vy = 0;
                    part.rotationSpeed = 0;
                }
            }

            // Update rotation
            part.rotation += part.rotationSpeed * dtFactor;

            return true;
        });
    }

    getParts(): RagdollPart[] {
        return this.parts;
    }

    clear(): void {
        this.parts = [];
    }
}
