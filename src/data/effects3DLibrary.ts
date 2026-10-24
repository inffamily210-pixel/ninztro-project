import { Effect3DPreset, Effect3DCategory, Attached3DType } from '../types/editor.ts';

// Generator to produce clean, varied, high-fidelity presets totaling 240+ effects
function buildCatalog(): Effect3DPreset[] {
  const presets: Effect3DPreset[] = [];

  // Helper to add
  const add = (
    id: string,
    name: string,
    category: Effect3DCategory,
    subcategory: string,
    type: Attached3DType,
    defaultColor: string,
    defaultSize: number,
    defaultDepthZ: number,
    tags: string[],
    description: string
  ) => {
    presets.push({
      id,
      name,
      category,
      subcategory,
      type,
      iconType: type,
      defaultColor,
      defaultSize,
      defaultDepthZ,
      tags,
      description,
      animationSpeed: 1.0,
    });
  };

  // ==========================================
  // CATEGORY 1: Cyberpunk & Sci-Fi HUD (45 items)
  // ==========================================
  const hudVariants = [
    { name: 'Apex Target Lock', sub: 'Targeting', color: '#00ffff' },
    { name: 'Tactical Recon Crosshair', sub: 'Tactical', color: '#ec4899' },
    { name: 'Biometric Iris Scanner', sub: 'Biometrics', color: '#10b981' },
    { name: 'GPS Satellite Ping', sub: 'Navigation', color: '#f59e0b' },
    { name: 'Quantum Gyroscope HUD', sub: 'Sensors', color: '#a855f7' },
    { name: 'Drone Flight Vector', sub: 'Telemetry', color: '#38bdf8' },
    { name: 'Thermal Threat Reticle', sub: 'Combat', color: '#ef4444' },
    { name: 'Shield Deflector Matrix', sub: 'Defense', color: '#06b6d4' },
    { name: 'Sonar Pulse Radar', sub: 'Radar', color: '#84cc16' },
    { name: 'Neural Link Interface', sub: 'Cyberware', color: '#d946ef' },
    { name: 'Laser Rangefinder Ring', sub: 'Targeting', color: '#eab308' },
    { name: 'Autonomous Vehicle Radar', sub: 'Sensors', color: '#6366f1' },
    { name: 'Hexagonal Combat Grid', sub: 'Defense', color: '#14b8a6' },
    { name: 'Cybernetic Weapon Lock', sub: 'Combat', color: '#f43f5e' },
    { name: 'Aviation Horizon Gyro', sub: 'Navigation', color: '#22d3ee' },
  ];

  hudVariants.forEach((v, idx) => {
    // 3 variations each: Alpha, Beta, Cyber
    add(
      `hud-${idx}-v1`,
      `${v.name} [Alpha]`,
      'cyberHud',
      v.sub,
      'cyberReticle',
      v.color,
      1.1,
      20,
      ['hud', 'reticle', 'target', v.sub.toLowerCase()],
      `High-precision 3D ${v.name.toLowerCase()} with rotating azimuth rings and telemetry readout.`
    );
    add(
      `hud-${idx}-v2`,
      `${v.name} [Dual Ring]`,
      'cyberHud',
      v.sub,
      'cyberReticle',
      v.color,
      1.25,
      25,
      ['hud', 'dual', 'scanner', v.sub.toLowerCase()],
      `Dual concentric orbital targeting rings locked to 3D motion vectors.`
    );
    add(
      `hud-${idx}-v3`,
      `${v.name} [Neon Strobe]`,
      'cyberHud',
      v.sub,
      'cyberReticle',
      v.color,
      1.0,
      15,
      ['hud', 'neon', 'strobe', v.sub.toLowerCase()],
      `Pulsing holographic crosshair with dynamic lock-on audio cues.`
    );
  });

  // ==========================================
  // CATEGORY 2: 3D Typography & Titles (42 items)
  // ==========================================
  const titleStyles = [
    { title: 'CYBER VISION 2077', sub: 'Cyberpunk', color: '#00ffff' },
    { title: 'TOKYO NIGHT DRIFT', sub: 'Cinematic', color: '#ec4899' },
    { title: 'NINZTRO TITANIUM', sub: 'Chrome Metal', color: '#ffffff' },
    { title: 'NEO MATRIX DATA', sub: 'Hacker', color: '#10b981' },
    { title: 'SYNTHWAVE HORIZON', sub: 'Retro 80s', color: '#f59e0b' },
    { title: 'DEEP SPACE EXPLORER', sub: 'Sci-Fi', color: '#a855f7' },
    { title: 'HYPER VELOCITY 4K', sub: 'Sport Action', color: '#ef4444' },
    { title: 'ANIME LUMINOUS SKY', sub: 'Anime', color: '#38bdf8' },
    { title: 'MONOLITH 3D BLOCK', sub: 'Heavy Block', color: '#94a3b8' },
    { title: 'GLITCH TELEGRAPH', sub: 'Glitch', color: '#fb7185' },
    { title: 'STEALTH OPS BLACKOUT', sub: 'Military', color: '#22c55e' },
    { title: 'AURA LUXURY GOLD', sub: 'Luxury', color: '#eab308' },
    { title: 'PARALLAX DEPTH SUB', sub: 'Minimal', color: '#e2e8f0' },
    { title: 'HOLOGRAPHIC STENCIL', sub: 'Futuristic', color: '#818cf8' },
  ];

  titleStyles.forEach((t, idx) => {
    add(
      `text3d-${idx}-extruded`,
      `${t.title} [3D Extrude]`,
      'typography3d',
      t.sub,
      'text3d',
      t.color,
      1.2,
      40,
      ['title', 'text3d', 'typography', t.sub.toLowerCase()],
      `Volumetric 3D extruded title with spatial tilt and cast shadows.`
    );
    add(
      `text3d-${idx}-neon`,
      `${t.title} [Neon Glow]`,
      'typography3d',
      t.sub,
      'text3d',
      t.color,
      1.3,
      50,
      ['neon', 'text', 'glow', t.sub.toLowerCase()],
      `Radiant multi-pass neon typography with edge bloom.`
    );
    add(
      `text3d-${idx}-glitch`,
      `${t.title} [Cyber Glitch]`,
      'typography3d',
      t.sub,
      'text3d',
      t.color,
      1.15,
      35,
      ['glitch', 'digital', 'cyber', t.sub.toLowerCase()],
      `Animated RGB displacement text that jitters with scene motion.`
    );
  });

  // ==========================================
  // CATEGORY 3: 3D Callout Pins & Telemetry (40 items)
  // ==========================================
  const callouts = [
    { label: 'OBJECT [SPEED: 120 KM/H]', color: '#10b981', sub: 'Velocity' },
    { label: 'LOCATION: SHIBUYA 35.6°N', color: '#00ffff', sub: 'GeoPin' },
    { label: 'ALTITUDE: 1,420M [LOCKED]', color: '#f59e0b', sub: 'Elevation' },
    { label: 'HEART RATE: 145 BPM', color: '#ef4444', sub: 'Biometrics' },
    { label: 'TEMPERATURE: 24°C OPTIMAL', color: '#38bdf8', sub: 'Telemetry' },
    { label: 'DISTANCE: 48.2 METERS', color: '#a855f7', sub: 'Radar' },
    { label: 'TARGET IDENTITY: VERIFIED', color: '#ec4899', sub: 'Security' },
    { label: 'DRONE BATTERY: 98%', color: '#84cc16', sub: 'Hardware' },
    { label: 'CAMERA FOCAL: 50MM F/1.2', color: '#eab308', sub: 'Optics' },
    { label: 'HORSEPOWER: 720 HP', color: '#f43f5e', sub: 'Motorsport' },
  ];

  callouts.forEach((c, idx) => {
    add(
      `pin-${idx}-pointer`,
      `${c.sub} Arrow Pin`,
      'calloutPins',
      c.sub,
      'calloutPin',
      c.color,
      0.95,
      15,
      ['pin', 'callout', 'arrow', c.sub.toLowerCase()],
      `3D anchored vector pin with dynamic leader line connected to point: ${c.label}`
    );
    add(
      `pin-${idx}-badge`,
      `${c.sub} Tech Spec Badge`,
      'calloutPins',
      c.sub,
      'calloutPin',
      c.color,
      1.0,
      20,
      ['badge', 'spec', 'data', c.sub.toLowerCase()],
      `Floating tech specification badge with live telemetry: ${c.label}`
    );
    add(
      `pin-${idx}-circle`,
      `${c.sub} Radar Dot Pin`,
      'calloutPins',
      c.sub,
      'calloutPin',
      c.color,
      0.9,
      10,
      ['dot', 'radar', 'pin', c.sub.toLowerCase()],
      `Minimal circular beacon pin pulsing in sync with footage movement.`
    );
    add(
      `pin-${idx}-hudline`,
      `${c.sub} Extended Horizon Line`,
      'calloutPins',
      c.sub,
      'calloutPin',
      c.color,
      1.05,
      25,
      ['horizon', 'line', 'telemetry', c.sub.toLowerCase()],
      `Angled 45° leader line connecting tracking point to info display.`
    );
  });

  // ==========================================
  // CATEGORY 4: 3D Geometric Primitives & Spatial Meshes (42 items)
  // ==========================================
  const shapes = [
    { name: 'Tesseract 4D Hypercube', type: 'tesseract4d', color: '#a855f7', sub: 'Polyhedra' },
    { name: 'Holographic Wireframe Cube', type: 'wireframeCube', color: '#00ffff', sub: 'Primitives' },
    { name: 'DNA Double Helix Strand', type: 'dnaHelix', color: '#10b981', sub: 'BioSci' },
    { name: 'Hexagonal Deflector Shield', type: 'spatialShield', color: '#06b6d4', sub: 'Shields' },
    { name: 'Concentric Gyroscope Rings', type: 'gyroCompass', color: '#f59e0b', sub: 'Gyros' },
    { name: 'Stargate Portal Ring', type: 'portalRing', color: '#ec4899', sub: 'Vortices' },
    { name: 'Floating Wireframe Sphere', type: 'wireframeCube', color: '#38bdf8', sub: 'Spheres' },
    { name: 'Icosahedron Crystal Gem', type: 'wireframeCube', color: '#e879f9', sub: 'Crystals' },
    { name: 'Octahedron Prism Diamond', type: 'wireframeCube', color: '#f43f5e', sub: 'Prisms' },
    { name: 'Torus Donut Field', type: 'hologramRing', color: '#eab308', sub: 'Torus' },
    { name: 'Quantum Energy Orb', type: 'energySphere', color: '#6366f1', sub: 'Orbs' },
    { name: 'Cybernetic Cube Array', type: 'wireframeCube', color: '#14b8a6', sub: 'Arrays' },
    { name: 'Infinity Mobius Strip', type: 'hologramRing', color: '#fb7185', sub: 'Topology' },
    { name: 'Pyramidal Beam Matrix', type: 'wireframeCube', color: '#22c55e', sub: 'Pyramids' },
  ];

  shapes.forEach((s, idx) => {
    add(
      `geom-${idx}-orbit`,
      `${s.name} [Orbital Spin]`,
      'geometric3d',
      s.sub,
      s.type as Attached3DType,
      s.color,
      1.1,
      30,
      ['3d', 'geometry', 'mesh', s.sub.toLowerCase()],
      `Full 3D rotating ${s.name.toLowerCase()} that shifts perspective with camera parallax.`
    );
    add(
      `geom-${idx}-wire`,
      `${s.name} [Laser Wireframe]`,
      'geometric3d',
      s.sub,
      s.type as Attached3DType,
      s.color,
      1.25,
      40,
      ['laser', 'wireframe', 'grid', s.sub.toLowerCase()],
      `Intense laser wireframe structure hovering over tracked coordinates.`
    );
    add(
      `geom-${idx}-pulse`,
      `${s.name} [Quantum Pulse]`,
      'geometric3d',
      s.sub,
      s.type as Attached3DType,
      s.color,
      1.0,
      25,
      ['pulse', 'quantum', 'field', s.sub.toLowerCase()],
      `Rhythmically pulsing 3D volumetric structure reacting to camera velocity.`
    );
  });

  // ==========================================
  // CATEGORY 5: 3D Particles & Atmospheric VFX (42 items)
  // ==========================================
  const particles = [
    { name: 'Cyber Dust Floating Embers', sub: 'Atmospheric', color: '#f59e0b' },
    { name: 'Electric Tesla Arc Sparks', sub: 'Electricity', color: '#00ffff' },
    { name: 'Stardust Cosmic Vortex', sub: 'Cosmic', color: '#ec4899' },
    { name: 'Matrix Digital Rain Grid', sub: 'Cyber', color: '#10b981' },
    { name: 'Quantum Plasma Mist', sub: 'Plasma', color: '#a855f7' },
    { name: 'Laser Horizon Scanlines', sub: 'Lasers', color: '#ef4444' },
    { name: 'Golden Bokeh Orbs', sub: 'Cinematic', color: '#eab308' },
    { name: 'Hyperdrive Warp Streaks', sub: 'Kinetic', color: '#38bdf8' },
    { name: 'Sub-Zero Frost Shards', sub: 'Weather', color: '#67e8f9' },
    { name: 'Toxic Chemical Miasma', sub: 'Bio', color: '#84cc16' },
    { name: 'Neon Fiber-Optic Trails', sub: 'Trails', color: '#f43f5e' },
    { name: 'Bioluminescent Spores', sub: 'Nature', color: '#22c55e' },
    { name: 'Dark Matter Singularity', sub: 'Gravity', color: '#9333ea' },
    { name: 'Firestorm Flaming Embers', sub: 'Fire', color: '#ea580c' },
  ];

  particles.forEach((p, idx) => {
    add(
      `part-${idx}-vortex`,
      `${p.name} [Vortex]`,
      'particlesVfx',
      p.sub,
      'particleField',
      p.color,
      1.2,
      35,
      ['particle', 'vfx', 'sparks', p.sub.toLowerCase()],
      `3D swirling ${p.name.toLowerCase()} anchored to tracked depth plane.`
    );
    add(
      `part-${idx}-spread`,
      `${p.name} [Volumetric Field]`,
      'particlesVfx',
      p.sub,
      'particleField',
      p.color,
      1.4,
      45,
      ['volumetric', 'field', 'cloud', p.sub.toLowerCase()],
      `Expansive 3D particle cloud with depth occlusion and lighting reflection.`
    );
    add(
      `part-${idx}-stream`,
      `${p.name} [Directional Stream]`,
      'particlesVfx',
      p.sub,
      'particleField',
      p.color,
      1.1,
      25,
      ['stream', 'flow', 'wind', p.sub.toLowerCase()],
      `Directional flow following subject velocity and camera tilt.`
    );
  });

  // ==========================================
  // CATEGORY 6: 3D Camera Profiles & Motion Solvers (35 items)
  // ==========================================
  const cameraSolvers = [
    { name: 'Smooth Technocrane Dolly Push', sub: 'Cinematic', color: '#38bdf8' },
    { name: 'FPV Acro Drone Dive', sub: 'Drone', color: '#ec4899' },
    { name: 'Organic Handheld Documentary Drift', sub: 'Handheld', color: '#10b981' },
    { name: 'Bullet-Time 360° Matrix Orbit', sub: 'Orbit', color: '#00ffff' },
    { name: 'High-Impact Action Camera Shake', sub: 'Action', color: '#ef4444' },
    { name: 'Vertigo Hitchcock Dolly-Zoom', sub: 'Dramatic', color: '#f59e0b' },
    { name: 'Whip-Pan 180° Snap Turn', sub: 'Kinetic', color: '#a855f7' },
    { name: 'Zero-G Orbital Satellite Drift', sub: 'Space', color: '#eab308' },
    { name: 'Microscopic Rack-Focus Push', sub: 'Macro', color: '#14b8a6' },
    { name: 'Steadicam Smooth Tracking Run', sub: 'Gimbal', color: '#6366f1' },
    { name: 'Anamorphic Cinema 2.39:1 Scope', sub: 'Anamorphic', color: '#f43f5e' },
    { name: 'Helicopter Aerial Flyover', sub: 'Aerial', color: '#84cc16' },
  ];

  cameraSolvers.forEach((cs, idx) => {
    add(
      `cam-${idx}-slow`,
      `${cs.name} [Cinematic Slow]`,
      'cameraMotion',
      cs.sub,
      'custom3d',
      cs.color,
      1.0,
      20,
      ['camera', 'solve', 'motion', cs.sub.toLowerCase()],
      `Ultra-smooth 3D camera solver profile with dampened accelerometer inertia.`
    );
    add(
      `cam-${idx}-dynamic`,
      `${cs.name} [Dynamic Punch]`,
      'cameraMotion',
      cs.sub,
      'custom3d',
      cs.color,
      1.2,
      30,
      ['dynamic', 'speed', 'camera', cs.sub.toLowerCase()],
      `Fast-response 3D camera motion vectors with accentuated depth parallax.`
    );
    if (idx < 11) {
      add(
        `cam-${idx}-parallax`,
        `${cs.name} [Extreme Parallax]`,
        'cameraMotion',
        cs.sub,
        'custom3d',
        cs.color,
        1.35,
        45,
        ['parallax', 'depth', 'camera', cs.sub.toLowerCase()],
        `High depth separation solving foreground, midground and background layers independently.`
      );
    }
  });

  return presets;
}

// 240+ Curated 3D effects catalog
export const EFFECTS_3D_LIBRARY: Effect3DPreset[] = buildCatalog();

export function getEffectsCount(): number {
  return EFFECTS_3D_LIBRARY.length;
}

export function searchEffects(
  query: string,
  category: Effect3DCategory = 'all'
): Effect3DPreset[] {
  const cleanQ = query.trim().toLowerCase();
  return EFFECTS_3D_LIBRARY.filter((effect) => {
    const matchesCat = category === 'all' || effect.category === category;
    if (!matchesCat) return false;
    if (!cleanQ) return true;
    return (
      effect.name.toLowerCase().includes(cleanQ) ||
      effect.subcategory.toLowerCase().includes(cleanQ) ||
      effect.tags.some((t) => t.toLowerCase().includes(cleanQ)) ||
      effect.description.toLowerCase().includes(cleanQ)
    );
  });
}

export const CATEGORY_LABELS: Record<Effect3DCategory, { label: string; count: number; icon: string }> = {
  all: { label: 'Semua Efek', count: EFFECTS_3D_LIBRARY.length, icon: 'Sparkles' },
  cyberHud: {
    label: 'Cyber HUD & Reticle',
    count: EFFECTS_3D_LIBRARY.filter((e) => e.category === 'cyberHud').length,
    icon: 'Crosshair',
  },
  typography3d: {
    label: 'Teks & Judul 3D',
    count: EFFECTS_3D_LIBRARY.filter((e) => e.category === 'typography3d').length,
    icon: 'Type',
  },
  calloutPins: {
    label: 'Callout & Pin 3D',
    count: EFFECTS_3D_LIBRARY.filter((e) => e.category === 'calloutPins').length,
    icon: 'Move',
  },
  geometric3d: {
    label: 'Objek & Mesh 3D',
    count: EFFECTS_3D_LIBRARY.filter((e) => e.category === 'geometric3d').length,
    icon: 'Box',
  },
  particlesVfx: {
    label: 'Partikel & VFX 3D',
    count: EFFECTS_3D_LIBRARY.filter((e) => e.category === 'particlesVfx').length,
    icon: 'Flame',
  },
  cameraMotion: {
    label: 'Profil Kamera 3D',
    count: EFFECTS_3D_LIBRARY.filter((e) => e.category === 'cameraMotion').length,
    icon: 'Camera',
  },
};
