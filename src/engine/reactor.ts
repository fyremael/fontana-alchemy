import { Particle, ReactorConfig, CollisionEvent, HypergraphNode, HypergraphEdge, LambdaTerm } from '../types';
import { collideTerms, formatTerm, classifyRole, getSpeciesColor, cloneTerm } from './lambda';
import { generateRandomCombinator, getCatalyticTriplet, getSKICopyClosure, getParasiteTerm } from './combinators';

export class ReactorEngine {
  public particles: Particle[] = [];
  public config: ReactorConfig;
  public width: number;
  public height: number;
  public recentEvents: CollisionEvent[] = [];
  public hypergraphNodes: Map<string, HypergraphNode> = new Map();
  public hypergraphEdges: Map<string, HypergraphEdge> = new Map();

  // Diagnostics counters
  public totalCollisions = 0;
  public reactionsSucceeded = 0;
  public sterileCollisions = 0;
  public dilutionCount = 0;

  // Perturbation status
  public perturbationActive = false;
  private perturbationTimer = 0;

  private nextId = 1;

  constructor(width = 800, height = 600, config?: Partial<ReactorConfig>) {
    this.width = width;
    this.height = height;
    this.config = {
      capacity: 90,
      particleSpeed: 0.6,
      collisionRadius: 10,
      dilutionRate: 1.0,
      maxReductionSteps: 150,
      maxTermSize: 40,
      twoWayCollision: true,
      activePresetId: 'level0',
      ...config
    };

    this.initLevel0();
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public updateConfig(newConfig: Partial<ReactorConfig>) {
    this.config = { ...this.config, ...newConfig };
    // Adjust capacity if needed
    while (this.particles.length > this.config.capacity) {
      this.particles.pop();
    }
    while (this.particles.length < this.config.capacity) {
      this.addParticle(generateRandomCombinator(3));
    }
  }

  public createParticle(term: LambdaTerm, x?: number, y?: number): Particle {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.8 + Math.random() * 1.2) * this.config.particleSpeed;
    const label = formatTerm(term);
    const role = classifyRole(label);
    const color = getSpeciesColor(label, role);

    return {
      id: `p-${this.nextId++}`,
      x: x ?? (20 + Math.random() * (this.width - 40)),
      y: y ?? (20 + Math.random() * (this.height - 40)),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: this.config.collisionRadius,
      term: cloneTerm(term),
      speciesKey: term.canonical,
      label,
      color,
      role,
      age: 0,
      lastReactionTime: 0,
      haloAlpha: 0
    };
  }

  public addParticle(term: LambdaTerm, x?: number, y?: number): Particle {
    const p = this.createParticle(term, x, y);
    this.particles.push(p);
    this.recordNode(p.speciesKey, p.label, p.color, p.role);
    return p;
  }

  /**
   * Reset the reactor to Level 0 Entropic Noise
   */
  public initLevel0() {
    this.particles = [];
    this.recentEvents = [];
    this.hypergraphNodes.clear();
    this.hypergraphEdges.clear();
    this.totalCollisions = 0;
    this.reactionsSucceeded = 0;
    this.sterileCollisions = 0;
    this.dilutionCount = 0;
    this.perturbationActive = false;

    for (let i = 0; i < this.config.capacity; i++) {
      this.addParticle(generateRandomCombinator(3));
    }
  }

  /**
   * Inject Fontana Level 1 Catalytic Triplet (A, B, C)
   */
  public injectCatalyticTriplet(proportion = 0.35) {
    const [A, B, C] = getCatalyticTriplet();
    const countToInject = Math.floor(this.config.capacity * proportion);
    const tripletsCount = Math.floor(countToInject / 3);

    // Replace random ambient noise particles with A, B, C
    for (let i = 0; i < tripletsCount; i++) {
      const idx1 = Math.floor(Math.random() * this.particles.length);
      this.particles[idx1] = this.createParticle(A, this.particles[idx1]?.x, this.particles[idx1]?.y);

      const idx2 = Math.floor(Math.random() * this.particles.length);
      this.particles[idx2] = this.createParticle(B, this.particles[idx2]?.x, this.particles[idx2]?.y);

      const idx3 = Math.floor(Math.random() * this.particles.length);
      this.particles[idx3] = this.createParticle(C, this.particles[idx3]?.x, this.particles[idx3]?.y);
    }
  }

  /**
   * Inject SKI Reconstructive Copy Closure
   */
  public injectSKICopyClosure(proportion = 0.35) {
    const skiTerms = getSKICopyClosure();
    const countToInject = Math.floor(this.config.capacity * proportion);

    for (let i = 0; i < countToInject; i++) {
      const term = skiTerms[i % skiTerms.length];
      const idx = Math.floor(Math.random() * this.particles.length);
      this.particles[idx] = this.createParticle(term, this.particles[idx]?.x, this.particles[idx]?.y);
    }
  }

  /**
   * Inject Parasite molecules P to stress test Level 2 organization
   */
  public injectParasite(count = 25) {
    const P = getParasiteTerm();
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * this.particles.length);
      this.particles[idx] = this.createParticle(P, this.particles[idx]?.x, this.particles[idx]?.y);
    }
  }

  /**
   * Perturb / Stress Test the organization:
   * Injects thermal noise and bursts of random combinators
   */
  public perturbSystem(noiseCount = 40) {
    this.perturbationActive = true;
    this.perturbationTimer = 300; // ~5 seconds at 60fps

    for (let i = 0; i < noiseCount; i++) {
      const idx = Math.floor(Math.random() * this.particles.length);
      const noise = generateRandomCombinator(3);
      this.particles[idx] = this.createParticle(noise, this.particles[idx]?.x, this.particles[idx]?.y);
    }

    // Give velocity kicks
    for (const p of this.particles) {
      p.vx += (Math.random() - 0.5) * 4;
      p.vy += (Math.random() - 0.5) * 4;
    }
  }

  /**
   * Record or update node in the reaction hypergraph
   */
  private recordNode(key: string, label: string, color: string, role: any) {
    const existing = this.hypergraphNodes.get(key);
    if (existing) {
      existing.count++;
    } else {
      this.hypergraphNodes.set(key, {
        id: key,
        label,
        count: 1,
        color,
        role
      });
    }
  }

  /**
   * Record edge in reaction hypergraph
   */
  private recordEdge(reactantA: string, reactantB: string, product: string) {
    const edgeKey = `${reactantA}+${reactantB}->${product}`;
    const existing = this.hypergraphEdges.get(edgeKey);
    const now = Date.now();
    if (existing) {
      existing.weight++;
      existing.lastActive = now;
    } else {
      this.hypergraphEdges.set(edgeKey, {
        id: edgeKey,
        reactantA,
        reactantB,
        product,
        weight: 1,
        lastActive: now
      });
    }
  }

  /**
   * Physics & collision step with 2D spatial binning
   */
  public step(dt = 1) {
    const speedMult = this.config.particleSpeed;
    const width = this.width;
    const height = this.height;
    const radius = this.config.collisionRadius;
    const now = Date.now();

    if (this.perturbationActive) {
      this.perturbationTimer--;
      if (this.perturbationTimer <= 0) {
        this.perturbationActive = false;
      }
    }

    // 1. Move particles and handle wall reflections
    for (const p of this.particles) {
      p.x += p.vx * speedMult * dt;
      p.y += p.vy * speedMult * dt;
      p.age += dt;

      // Dampen visual reaction pulse
      if (p.haloAlpha > 0) {
        p.haloAlpha = Math.max(0, p.haloAlpha - 0.03 * dt);
      }

      // Elastic wall bounces
      if (p.x < radius) {
        p.x = radius;
        p.vx = Math.abs(p.vx);
      } else if (p.x > width - radius) {
        p.x = width - radius;
        p.vx = -Math.abs(p.vx);
      }

      if (p.y < radius) {
        p.y = radius;
        p.vy = Math.abs(p.vy);
      } else if (p.y > height - radius) {
        p.y = height - radius;
        p.vy = -Math.abs(p.vy);
      }
    }

    // 2. Spatial Grid Partitioning for O(N) collision detection
    const cellSize = radius * 2.8;
    const grid = new Map<string, number[]>();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const cx = Math.floor(p.x / cellSize);
      const cy = Math.floor(p.y / cellSize);
      const key = `${cx},${cy}`;
      const bucket = grid.get(key);
      if (bucket) {
        bucket.push(i);
      } else {
        grid.set(key, [i]);
      }
    }

    // Check collisions in neighboring cells
    const checkedPairs = new Set<string>();

    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const cx = Math.floor(p1.x / cellSize);
      const cy = Math.floor(p1.y / cellSize);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const neighborKey = `${cx + dx},${cy + dy}`;
          const bucket = grid.get(neighborKey);
          if (!bucket) continue;

          for (const j of bucket) {
            if (i >= j) continue;
            const pairKey = `${i}-${j}`;
            if (checkedPairs.has(pairKey)) continue;
            checkedPairs.add(pairKey);

            const p2 = this.particles[j];
            const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
            const minDist = (p1.radius + p2.radius);

            if (distSq < minDist * minDist) {
              this.handleCollision(p1, p2, Math.sqrt(distSq), minDist, now);
            }
          }
        }
      }
    }

    // Age out old collision visual events (retain for ~2.2 seconds, max 12 events)
    const cutoff = now - 2200;
    this.recentEvents = this.recentEvents.filter(e => e.time >= cutoff);
    if (this.recentEvents.length > 12) {
      this.recentEvents.splice(0, this.recentEvents.length - 12);
    }
  }

  /**
   * Handle physical bounce + Lambda Calculus functional application reaction
   */
  private handleCollision(p1: Particle, p2: Particle, dist: number, minDist: number, now: number) {
    this.totalCollisions++;

    // 1. Elastic Physical Collision Physics
    const nx = (p2.x - p1.x) / (dist || 1);
    const ny = (p2.y - p1.y) / (dist || 1);

    // Separate overlapping particles
    const overlap = 0.5 * (minDist - dist);
    p1.x -= nx * overlap;
    p1.y -= ny * overlap;
    p2.x += nx * overlap;
    p2.y += ny * overlap;

    // Exchange momentum along normal
    const kx = p1.vx - p2.vx;
    const ky = p1.vy - p2.vy;
    const p = 2 * (nx * kx + ny * ky) / 2; // Equal masses
    p1.vx -= p * nx;
    p1.vy -= p * ny;
    p2.vx += p * nx;
    p2.vy += p * ny;

    // Cooldown check: 250ms refractory period gives clear, observable interaction pacing
    if (now - p1.lastReactionTime < 250 || now - p2.lastReactionTime < 250) {
      return;
    }

    // 2. Chemical Collision: Functional Application C = eval(A B)
    // Stochastic direction: 50% A(B), 50% B(A), or two-way
    let primary = p1;
    let secondary = p2;
    if (Math.random() < 0.5) {
      primary = p2;
      secondary = p1;
    }

    const reaction = collideTerms(
      primary.term,
      secondary.term,
      this.config.maxReductionSteps,
      this.config.maxTermSize
    );

    let product = reaction.product;

    // If symmetric evaluation is allowed and first direction was sterile, try B(A)
    if ((!reaction.success || !product) && this.config.twoWayCollision) {
      const revReaction = collideTerms(
        secondary.term,
        primary.term,
        this.config.maxReductionSteps,
        this.config.maxTermSize
      );
      if (revReaction.success && revReaction.product) {
        product = revReaction.product;
        primary = p2;
        secondary = p1;
      }
    }

    if (product) {
      this.reactionsSucceeded++;

      // Visual flash
      primary.haloAlpha = 1.0;
      secondary.haloAlpha = 1.0;
      primary.lastReactionTime = now;
      secondary.lastReactionTime = now;

      const productLabel = formatTerm(product);
      const productRole = classifyRole(productLabel);
      const productColor = getSpeciesColor(productLabel, productRole);

      // Record in hypergraph
      this.recordEdge(primary.speciesKey, secondary.speciesKey, product.canonical);
      this.recordNode(product.canonical, productLabel, productColor, productRole);

      // Add collision visual event
      this.recentEvents.push({
        x: (primary.x + secondary.x) / 2,
        y: (primary.y + secondary.y) / 2,
        termA: primary.label,
        termB: secondary.label,
        productTerm: productLabel,
        success: true,
        time: now
      });

      // CSTR Dilution / Mass Preservation:
      // Replace an ambient/random particle in the reactor with the new product
      if (Math.random() < this.config.dilutionRate) {
        this.diluteAndInsert(product, primary.x, primary.y);
      }
    } else {
      this.sterileCollisions++;
    }
  }

  /**
   * Continuous Dilution Flux:
   * Chooses an ambient or random molecule to wash out, replacing it with the newly synthesized product
   */
  private diluteAndInsert(product: LambdaTerm, spawnX: number, spawnY: number) {
    this.dilutionCount++;

    // Select candidate to wash out: prefer noise or old particles
    let targetIdx = Math.floor(Math.random() * this.particles.length);
    for (let attempt = 0; attempt < 3; attempt++) {
      const idx = Math.floor(Math.random() * this.particles.length);
      if (this.particles[idx].role === 'noise') {
        targetIdx = idx;
        break;
      }
    }

    // In a stirred reactor, newly synthesized product disperses into the ambient volume
    const spawnPosX = 25 + Math.random() * (this.width - 50);
    const spawnPosY = 25 + Math.random() * (this.height - 50);
    const newParticle = this.createParticle(product, spawnPosX, spawnPosY);
    newParticle.haloAlpha = 1.0;
    newParticle.lastReactionTime = Date.now();

    this.particles[targetIdx] = newParticle;
  }
}
