import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {createPortal} from "react-dom";
import Link from "@docusaurus/Link";
import styles from "./PandaRider.module.css";
import "../../Journal/tokens.css";

// ─── PIXEL SPRITE RENDERER ────────────────────────────────────────────────────
const PC = {0: null, 1: "skin", 2: "hair", 3: "jacket", 4: "trousers",
  5: "shoe", 6: "bag", 7: "metal", 8: "wheel", 9: "cash", 10: "shirt"};
function paint(ctx, token) { return ctx.riderPaint.getPropertyValue(token).trim(); }

const RIDER_A = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,0],
  [0,0,3,3,6,6,6,6,6,6,3,3,3,0,0,0],
  [0,0,3,6,6,6,6,6,6,6,6,3,0,0,0,0],
  [0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0],
  [0,4,4,3,3,3,3,3,3,3,4,4,0,0,0,0],
  [0,4,4,0,0,0,0,0,0,0,4,4,0,0,0,0],
  [4,4,0,0,0,0,0,0,0,0,0,4,4,0,0,0],
  [5,5,0,0,7,7,7,7,7,7,7,0,0,0,0,0],
  [0,0,0,8,8,0,0,0,0,0,8,8,0,0,0,0],
  [0,0,8,8,8,8,0,0,0,8,8,8,8,0,0,0],
  [0,0,8,0,0,8,0,0,0,8,0,0,8,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
const RIDER_B = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,0],
  [0,0,3,3,6,6,6,6,6,6,3,3,3,0,0,0],
  [0,0,3,6,6,6,6,6,6,6,6,3,0,0,0,0],
  [0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0],
  [4,4,3,3,3,3,3,3,3,3,3,4,4,0,0,0],
  [4,4,0,0,0,0,0,0,0,0,0,4,4,0,0,0],
  [4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0],
  [5,5,0,0,7,7,7,7,7,7,7,0,0,0,0,0],
  [0,0,0,8,8,0,0,0,0,0,8,8,0,0,0,0],
  [0,0,8,8,8,8,0,0,0,8,8,8,8,0,0,0],
  [0,0,8,0,0,8,0,0,0,8,0,0,8,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// girl pixel
const GIRL_A = [
  [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0],
  [0,0,10,10,10,10,10,10,10,10,10,0,0,0,0,0],
  [0,0,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
  [0,0,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
  [0,0,4,4,10,10,10,10,10,4,4,0,0,0,0,0],
  [0,0,4,4,0,0,0,0,0,0,4,4,0,0,0,0],
  [0,0,4,0,0,0,0,0,0,0,0,4,0,0,0,0],
  [0,0,5,5,0,0,0,0,0,0,0,5,5,0,0,0],
  [0,0,0,0,9,9,9,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,9,0,9,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function PixelSprite({ frame, scale = 3, palette = PC, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    frame.forEach((row, y) => row.forEach((ci, x) => {
      const col = palette[ci]; if (!col) return;
      ctx.fillStyle = getComputedStyle(c).getPropertyValue(`--rider-${col}`).trim();
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }));
  }, [frame, scale]);
  return <canvas ref={ref} width={16 * scale} height={16 * scale}
    style={{ imageRendering: "pixelated", ...style }} />;
}

// ─── SCENE RENDERERS (Canvas 2D) ─────────────────────────────────────────────
function useSceneCanvas(canvasRef, sceneName, tick, index) {
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.riderPaint = getComputedStyle(c);
    const W = c.width, H = c.height;

    if (sceneName === "street") drawStreet(ctx, W, H, tick);
    else if (sceneName === "corridor") drawCorridor(ctx, W, H, tick);
    else if (sceneName === "lobby") drawLobby(ctx, W, H, 0);
    else if (sceneName === "elevator_wait") drawElevatorWait(ctx, W, H, tick);
    else if (sceneName === "elevator_inside") drawElevatorInside(ctx, W, H, index === 9 ? 10 : 0);
    else if (sceneName === "floor6") drawFloor6(ctx, W, H, tick);
    else if (sceneName === "girl_scene") drawGirlScene(ctx, W, H, tick);
    else if (sceneName === "elevator_leaving") drawElevatorLeaving(ctx, W, H, tick);
    else if (sceneName === "night_city") drawNightCity(ctx, W, H, tick);
  }, [sceneName, tick, index]);
}

function drawStreet(ctx, W, H, t) {
  // Night street scrolling
  ctx.fillStyle = paint(ctx, "--rider-paint-1"); ctx.fillRect(0, 0, W, H);
  // Stars
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137 + t * 0.2) % W);
    const sy = (i * 53) % (H * 0.5);
    const br = Math.sin(t * 0.05 + i) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-1")},${br * 0.7})`;
    ctx.fillRect(sx, sy, 1, 1);
  }
  // Buildings silhouette
  const blds = [
    {x:0,w:60,h:120},{x:70,w:40,h:90},{x:120,w:80,h:150},{x:210,w:50,h:110},
    {x:270,w:70,h:130},{x:350,w:45,h:100},{x:400,w:90,h:160},{x:500,w:55,h:95},
    {x:560,w:80,h:140},{x:650,w:60,h:115},{x:720,w:100,h:155},{x:830,w:70,h:125},
  ];
  blds.forEach(b => {
    ctx.fillStyle = paint(ctx, "--rider-paint-2");
    ctx.fillRect(b.x, H - b.h - 60, b.w, b.h);
    // windows
    for (let wy = 0; wy < Math.floor(b.h / 16); wy++) {
      for (let wx = 0; wx < Math.floor(b.w / 14); wx++) {
        if ((b.x + b.w + wy * 3 + wx * 7) % 3 === 0) {
          const bright = Math.sin(t * 0.02 + b.x + wy + wx) > 0.7;
          ctx.fillStyle = bright ? paint(ctx, "--rider-paint-3") : paint(ctx, "--rider-paint-4");
          ctx.fillRect(b.x + wx * 14 + 4, H - b.h - 60 + wy * 16 + 4, 6, 8);
        }
      }
    }
  });
  // Ground
  ctx.fillStyle = paint(ctx, "--rider-paint-5"); ctx.fillRect(0, H - 60, W, 60);
  // Road marks scrolling
  const roadY = H - 30;
  for (let i = 0; i < 12; i++) {
    const rx = ((i * 80 - (t * 3) % 80 + W) % W) - 40;
    ctx.fillStyle = paint(ctx, "--rider-paint-6");
    ctx.fillRect(rx, roadY - 2, 36, 4);
  }
  // Street lights
  for (let i = 0; i < 6; i++) {
    const lx = ((i * 160 - (t * 3) % 160 + W) % W);
    ctx.fillStyle = paint(ctx, "--rider-paint-7"); ctx.fillRect(lx - 2, H - 90, 4, 34);
    ctx.fillStyle = paint(ctx, "--rider-paint-8"); ctx.fillRect(lx - 8, H - 90, 16, 5);
    const glow = ctx.createRadialGradient(lx, H - 88, 0, lx, H - 88, 30);
    glow.addColorStop(0, paint(ctx, "--rider-paint-9"));
    glow.addColorStop(1, paint(ctx, "--rider-paint-10"));
    ctx.fillStyle = glow; ctx.fillRect(lx - 30, H - 118, 60, 60);
    ctx.fillStyle = paint(ctx, "--rider-paint-11"); ctx.fillRect(lx - 3, H - 92, 6, 4);
  }
}

function drawCorridor(ctx, W, H, t) {
  ctx.fillStyle = paint(ctx, "--rider-paint-12"); ctx.fillRect(0, 0, W, H);
  // Vanishing point perspective corridor
  const cx = W / 2, cy = H * 0.45;
  // Floor
  ctx.fillStyle = paint(ctx, "--rider-paint-13"); ctx.beginPath();
  ctx.moveTo(0, H); ctx.lineTo(cx - 80, cy + 20);
  ctx.lineTo(cx + 80, cy + 20); ctx.lineTo(W, H); ctx.fill();
  // Ceiling
  ctx.fillStyle = paint(ctx, "--rider-paint-14"); ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(cx - 80, cy - 20);
  ctx.lineTo(cx + 80, cy - 20); ctx.lineTo(W, 0); ctx.fill();
  // Walls
  ctx.fillStyle = paint(ctx, "--rider-paint-15"); ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(cx - 80, cy - 20);
  ctx.lineTo(cx - 80, cy + 20); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = paint(ctx, "--rider-paint-15"); ctx.beginPath();
  ctx.moveTo(W, 0); ctx.lineTo(cx + 80, cy - 20);
  ctx.lineTo(cx + 80, cy + 20); ctx.lineTo(W, H); ctx.fill();
  // Corrugated roof panels – some missing
  for (let i = 0; i < 8; i++) {
    const px1 = W * (i / 8), px2 = W * ((i + 1) / 8);
    const prog = i / 8;
    const py1 = 0, py2 = cy - 20 + (cy - 20) * (1 - prog) * 0.2;
    if (i % 3 !== 1) {
      ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-2")},${0.6 + Math.sin(t * 0.03 + i) * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(px1, py1); ctx.lineTo(px2, py1);
      ctx.lineTo(cx + (px2 - W/2) * 0.15, py2);
      ctx.lineTo(cx + (px1 - W/2) * 0.15, py2);
      ctx.fill();
    }
  }
  // Bare wires
  for (let i = 0; i < 5; i++) {
    const wy = H * 0.12 + i * 12;
    ctx.strokeStyle = `rgba(${paint(ctx, "--rider-rgb-3")},${0.4 + i * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(W, cy * 0.4 + i * 5); ctx.stroke();
  }
  // Flickering fluorescent lights
  for (let i = 0; i < 3; i++) {
    const lx = cx + (i - 1) * 60 * (1 - i * 0.1);
    const ly = cy - 18 - i * 4;
    const flicker = 0.7;
    ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-4")},${flicker * 0.9})`;
    ctx.fillRect(lx - 20, ly, 40, 3);
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 60);
    lg.addColorStop(0, `rgba(${paint(ctx, "--rider-rgb-5")},${flicker * 0.25})`);
    lg.addColorStop(1, paint(ctx, "--rider-paint-16"));
    ctx.fillStyle = lg; ctx.fillRect(lx - 60, ly - 30, 120, 90);
  }
  // Iron mailboxes on right wall
  for (let i = 0; i < 4; i++) {
    const mx = W * 0.72 + i * 2;
    const my = H * 0.5 + i * 8;
    const ms = 22 - i * 2;
    ctx.fillStyle = paint(ctx, "--rider-paint-17"); ctx.fillRect(mx, my, ms, ms * 0.7);
    ctx.strokeStyle = paint(ctx, "--rider-paint-7"); ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, ms, ms * 0.7);
    if (i === 0) {
      ctx.fillStyle = paint(ctx, "--rider-paint-18"); ctx.font = "8px monospace";
      ctx.fillText("102", mx + 2, my + 12);
    }
  }
  // Wind particles
  for (let i = 0; i < 12; i++) {
    const px = ((i * 97 + t * 4) % W);
    const py = H * 0.3 + (i * 43) % (H * 0.5);
    ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-6")},${0.1 + Math.random() * 0.1})`;
    ctx.fillRect(px, py, 3 + Math.random() * 4, 1);
  }
}

function drawLobby(ctx, W, H, t) {
  ctx.fillStyle = paint(ctx, "--rider-paint-19"); ctx.fillRect(0, 0, W, H);
  // Lobby interior - looking toward elevator
  const cx = W / 2;
  // Floor tiles
  ctx.fillStyle = paint(ctx, "--rider-paint-20");
  ctx.fillRect(0, H * 0.55, W, H);
  for (let tx = 0; tx < 12; tx++) {
    for (let ty = 0; ty < 4; ty++) {
      if ((tx + ty) % 2 === 0) {
        ctx.fillStyle = paint(ctx, "--rider-paint-21");
        ctx.fillRect(tx * (W / 12), H * 0.55 + ty * 30, W / 12, 30);
      }
    }
  }
  // Wall
  ctx.fillStyle = paint(ctx, "--rider-paint-22"); ctx.fillRect(0, 0, W, H * 0.55);
  // Elevator door
  ctx.fillStyle = paint(ctx, "--rider-paint-23"); ctx.fillRect(cx - 50, H * 0.2, 100, H * 0.4);
  ctx.strokeStyle = paint(ctx, "--rider-paint-24"); ctx.lineWidth = 2;
  ctx.strokeRect(cx - 50, H * 0.2, 100, H * 0.4);
  // Elevator gap line
  ctx.fillStyle = paint(ctx, "--rider-paint-7"); ctx.fillRect(cx - 1, H * 0.2, 2, H * 0.4);
  // Floor indicator
  const floorNum = 1;
  ctx.fillStyle = paint(ctx, "--rider-paint-13"); ctx.fillRect(cx + 52, H * 0.22, 28, 22);
  ctx.fillStyle = paint(ctx, "--rider-paint-18"); ctx.font = "bold 14px monospace";
  ctx.fillText(floorNum, cx + 58, H * 0.22 + 16);
  // Up arrow
  ctx.fillStyle = paint(ctx, "--rider-paint-18"); ctx.font = "10px monospace";
  ctx.fillText("▲", cx + 58, H * 0.22 + 28);
  // Dim light
  const lg = ctx.createRadialGradient(cx, H * 0.15, 0, cx, H * 0.15, 120);
  lg.addColorStop(0, paint(ctx, "--rider-paint-25"));
  lg.addColorStop(1, paint(ctx, "--rider-paint-16"));
  ctx.fillStyle = lg; ctx.fillRect(cx - 120, 0, 240, 200);
}

function drawElevatorWait(ctx, W, H, t) {
  drawLobby(ctx, W, H, t);
  // Additional: bare wires on ceiling
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${paint(ctx, "--rider-rgb-7")},${0.5 + i * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(i * 60, 0); ctx.lineTo(W / 2 + i * 10, H * 0.2); ctx.stroke();
  }
  // Wind from corridor - particles blowing through
  for (let i = 0; i < 20; i++) {
    const windX = ((i * 113 + t * 6) % (W + 40)) - 20;
    const windY = H * 0.15 + (i * 37) % (H * 0.35);
    ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-8")},${0.05 + (i % 3) * 0.04})`;
    ctx.fillRect(windX, windY, 6 + (i % 4) * 2, 1);
  }
}

function drawElevatorInside(ctx, W, H, t) {
  ctx.fillStyle = paint(ctx, "--rider-paint-26"); ctx.fillRect(0, 0, W, H);
  // Elevator walls
  ctx.fillStyle = paint(ctx, "--rider-paint-27"); ctx.fillRect(W * 0.1, 0, W * 0.8, H);
  // Left wall
  ctx.fillStyle = paint(ctx, "--rider-paint-28"); ctx.fillRect(0, 0, W * 0.1, H);
  // Right wall
  ctx.fillStyle = paint(ctx, "--rider-paint-28"); ctx.fillRect(W * 0.9, 0, W * 0.1, H);
  // Floor
  ctx.fillStyle = paint(ctx, "--rider-paint-29"); ctx.fillRect(W * 0.1, H * 0.88, W * 0.8, H);
  // Ceiling with light
  ctx.fillStyle = paint(ctx, "--rider-paint-30"); ctx.fillRect(W * 0.1, 0, W * 0.8, H * 0.08);
  const flicker = 0.7;
  ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-4")},${flicker})`;
  ctx.fillRect(W * 0.35, H * 0.01, W * 0.3, H * 0.04);
  const lg = ctx.createRadialGradient(W / 2, H * 0.04, 0, W / 2, H * 0.04, H * 0.5);
  lg.addColorStop(0, `rgba(${paint(ctx, "--rider-rgb-5")},${flicker * 0.2})`);
  lg.addColorStop(1, paint(ctx, "--rider-paint-16"));
  ctx.fillStyle = lg; ctx.fillRect(W * 0.1, 0, W * 0.8, H);
  // Floor number display - LARGE
  const floors = [1, 2, 3, 4, 5, 6];
  const fi = Math.min(Math.floor((t * 0.4) % 6), 5);
  ctx.fillStyle = paint(ctx, "--rider-paint-13"); ctx.fillRect(W * 0.38, H * 0.12, W * 0.24, H * 0.16);
  ctx.fillStyle = fi === 5 ? paint(ctx, "--rider-paint-18") : paint(ctx, "--rider-paint-31");
  ctx.font = `bold ${Math.floor(H * 0.1)}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(floors[fi], W / 2, H * 0.25);
  ctx.textAlign = "left";
  // Arrow
  ctx.fillStyle = paint(ctx, "--rider-paint-31"); ctx.font = `${Math.floor(H * 0.04)}px monospace`;
  ctx.textAlign = "center"; ctx.fillText("▲", W / 2, H * 0.31); ctx.textAlign = "left";
  // Door seam
  ctx.strokeStyle = paint(ctx, "--rider-paint-32"); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W / 2, H * 0.08); ctx.lineTo(W / 2, H * 0.88); ctx.stroke();
  // Reflection on walls - subtle
  ctx.fillStyle = paint(ctx, "--rider-paint-33");
  ctx.fillRect(W * 0.1, H * 0.1, W * 0.05, H * 0.7);
  ctx.fillRect(W * 0.85, H * 0.1, W * 0.05, H * 0.7);
  // Mechanical vibration noise
  if (Math.sin(t * 12) > 0.7) {
    ctx.fillStyle = paint(ctx, "--rider-paint-34");
    ctx.fillRect(W * 0.1, 0, W * 0.8, H);
  }
}

function drawFloor6(ctx, W, H, t) {
  ctx.fillStyle = paint(ctx, "--rider-paint-35"); ctx.fillRect(0, 0, W, H);
  const cx = W / 2;
  // Hallway
  ctx.fillStyle = paint(ctx, "--rider-paint-26"); ctx.fillRect(cx - 120, H * 0.3, 240, H * 0.55);
  // Floor
  ctx.fillStyle = paint(ctx, "--rider-paint-36"); ctx.fillRect(0, H * 0.72, W, H);
  // Ceiling dark
  ctx.fillStyle = paint(ctx, "--rider-paint-37"); ctx.fillRect(0, 0, W, H * 0.3);
  // Dim fluorescent
  const fl2 = 0.6;
  ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-9")},${fl2})`;
  ctx.fillRect(cx - 60, H * 0.31, 120, 3);
  const g2 = ctx.createRadialGradient(cx, H * 0.32, 0, cx, H * 0.32, 160);
  g2.addColorStop(0, `rgba(${paint(ctx, "--rider-rgb-10")},${fl2 * 0.18})`);
  g2.addColorStop(1, paint(ctx, "--rider-paint-38"));
  ctx.fillStyle = g2; ctx.fillRect(cx - 160, H * 0.25, 320, 260);
  // Doors on sides
  for (let side = -1; side <= 1; side += 2) {
    const dx = cx + side * 160;
    ctx.fillStyle = paint(ctx, "--rider-paint-29"); ctx.fillRect(dx - 20, H * 0.42, 40, H * 0.32);
    ctx.strokeStyle = paint(ctx, "--rider-paint-23"); ctx.lineWidth = 1;
    ctx.strokeRect(dx - 20, H * 0.42, 40, H * 0.32);
    ctx.fillStyle = paint(ctx, "--rider-paint-39"); ctx.fillRect(dx + side * 12, H * 0.56, 4, 4);
  }
  // Wind from stairwell - strong gusts
  for (let i = 0; i < 25; i++) {
    const windX = ((i * 89 + t * 8) % (W + 50)) - 25;
    const windY = H * 0.35 + (i * 31) % (H * 0.35);
    const a = 0.06 + (i % 4) * 0.03;
    ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-11")},${a})`;
    ctx.fillRect(windX, windY, 8 + (i % 5) * 3, 1);
  }
}

function drawGirlScene(ctx, W, H, t) {
  ctx.fillStyle = paint(ctx, "--rider-paint-40"); ctx.fillRect(0, 0, W, H);
  const cx = W / 2;
  // Same hallway but softer
  ctx.fillStyle = paint(ctx, "--rider-paint-41"); ctx.fillRect(cx - 140, H * 0.25, 280, H * 0.6);
  ctx.fillStyle = paint(ctx, "--rider-paint-22"); ctx.fillRect(0, H * 0.72, W, H);
  // Warmer light this time
  const warmLight = ctx.createRadialGradient(cx, H * 0.45, 10, cx, H * 0.45, 180);
  warmLight.addColorStop(0, paint(ctx, "--rider-paint-42"));
  warmLight.addColorStop(1, paint(ctx, "--rider-paint-43"));
  ctx.fillStyle = warmLight; ctx.fillRect(cx - 180, H * 0.2, 360, H * 0.65);
  // Her room door slightly ajar - warm glow from inside
  ctx.fillStyle = paint(ctx, "--rider-paint-44");
  ctx.fillRect(cx + 90, H * 0.35, 50, H * 0.38);
  const doorGlow = ctx.createLinearGradient(cx + 90, 0, cx + 140, 0);
  doorGlow.addColorStop(0, paint(ctx, "--rider-paint-45"));
  doorGlow.addColorStop(0.3, paint(ctx, "--rider-paint-46"));
  doorGlow.addColorStop(1, paint(ctx, "--rider-paint-47"));
  ctx.fillStyle = doorGlow; ctx.fillRect(cx + 80, H * 0.3, 80, H * 0.45);
  // Heartbeat glow for girl
  const pulse = 0.7 + Math.sin(t * 0.15) * 0.3;
  ctx.fillStyle = `rgba(${paint(ctx, "--rider-rgb-12")},${pulse * 0.06})`;
  ctx.beginPath();
  ctx.ellipse(cx - 20, H * 0.58, 35, 50, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawElevatorLeaving(ctx, W, H, t) {
  drawElevatorInside(ctx, W, H, t + 10);
  // Closing doors animation
  const close = Math.min((t % 20) / 6, 1);
  ctx.fillStyle = paint(ctx, "--rider-paint-23");
  ctx.fillRect(W * 0.1, H * 0.08, (W * 0.4) * close, H * 0.8);
  ctx.fillRect(W * 0.9 - (W * 0.4) * close, H * 0.08, (W * 0.4) * close, H * 0.8);
}

function drawNightCity(ctx, W, H, t) {
  drawStreet(ctx, W, H, t);
  // Rain overlay
  for (let i = 0; i < 80; i++) {
    const rx = (i * 73 + t * 5) % W;
    const ry = ((i * 53 + t * 12) % H);
    ctx.strokeStyle = paint(ctx, "--rider-rain");
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 8); ctx.stroke();
  }
}

// ─── STORY DATA ───────────────────────────────────────────────────────────────
const STORY = [
  {
    scene: "street",
    text: "昨天晚上七點\n接到一個單",
    speed: 60,
    sound: "wind_soft",
    showRider: true,
  },
  {
    scene: "street",
    text: "在主街轉進中巷，再拐進小巷的巷尾。",
    speed: 55,
    sound: "wind_soft",
    showRider: true,
  },
  {
    scene: "corridor",
    text: "這是舊式L型的大樓，大門是一條長長的鐵皮塑料板。",
    speed: 50,
    sound: "wind_strong",
    showRider: false,
  },
  {
    scene: "corridor",
    text: "看起來像一條「灌風的通廊」。",
    speed: 60,
    sound: "wind_strong",
  },
  {
    scene: "lobby",
    text: "左側是 98 號棟，發現走錯了。",
    speed: 50,
    sound: "wind_strong",
  },
  {
    scene: "lobby",
    text: "不會吧，我要在這棟晦暗破舊的大樓裡找多久？\n\n希望這裡是 102 號。",
    speed: 45,
    sound: "wind_strong",
  },
  {
    scene: "elevator_wait",
    text: "裸露的電線密密麻麻，\n我還真怕老鼠掉下來。",
    speed: 55,
    sound: "wind_strong",
  },
  {
    scene: "elevator_wait",
    text: "東西壞了、破了，通常會有種「可能會被修復」的感覺。\n\n但這裡，好像沒有任何會再被修復的痕跡。",
    speed: 42,
    sound: "wind_strong",
  },
  {
    scene: "elevator_inside",
    text: "我閉上眼深呼吸。",
    speed: 70,
    sound: "elevator",
  },
  {
    scene: "elevator_inside",
    text: "電梯顯示到五樓\n\n再上去就是六樓。",
    speed: 65,
    sound: "elevator",
  },
  {
    scene: "floor6",
    text: "六樓到了。\n\n電梯門緩緩打開。",
    speed: 70,
    sound: "ding",
  },
  {
    scene: "floor6",
    text: "我先看到天花板的晦暗，\n才看到日光燈黯淡地亮著。",
    speed: 50,
    sound: "wind_floor6",
  },
  {
    scene: "girl_scene",
    text: "一個大約八、九歲的小女孩，\n右手的小拳頭握著百元鈔，\n眼睛圓圓亮亮，很乖巧。",
    speed: 48,
    showGirl: true,
    sound: "quiet",
  },
  {
    scene: "girl_scene",
    text: "「姊姊，這是兩百元。」\n\n「這裡很暗，下次在門口亮亮的等餐就好，好嗎？」",
    speed: 52,
    showGirl: true,
    sound: "quiet",
  },
  {
    scene: "girl_scene",
    text: "「一塊錢不用了。謝謝你送過來，\n辛苦了，注意安全哦。」",
    speed: 48,
    showGirl: true,
    sound: "quiet",
  },
  {
    scene: "girl_scene",
    text: "那一瞬間，\n心裡的防備鬆開了。",
    speed: 60,
    showGirl: true,
    sound: "quiet",
  },
  {
    scene: "elevator_leaving",
    text: "我走進電梯。\n\n門關上。",
    speed: 65,
    sound: "elevator",
  },
  {
    scene: "night_city",
    text: "當睜開眼睛時，\n也許不是先看到水平，也不是先看到垂直。",
    speed: 45,
    showRider: true,
    sound: "wind_soft",
  },
  {
    scene: "night_city",
    text: "先看到的，\n\n其實是自己內心投射的想像。",
    speed: 50,
    sound: "wind_soft",
  },
  {
    scene: "night_city",
    text: "這棟晦暗破舊的大樓，\n對我是一個不安的地方。\n\n對那個小女孩來說，\n那是她正在長大的家。",
    speed: 44,
    showRider: true,
    sound: "wind_soft",
  },
  {
    scene: "night_city",
    text: "你覺得呢？",
    speed: 80,
    isEnd: true,
    sound: "quiet",
  },
];


const LOCATIONS = {
  street: '街上 · 晚上七點', corridor: '巷尾 · 灌風的通廊', lobby: '一樓 · 尋找 102 號',
  elevator_wait: '一樓 · 等電梯', elevator_inside: '電梯 · 上樓', floor6: '六樓 · 門開了',
  girl_scene: '六樓 · 交付餐點', elevator_leaving: '電梯 · 離開', night_city: '街上 · 回程',
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

// One context per visit, closed on exit. Sound starts only from an explicit button.
function useAmbience(enabled, soundName) {
  const context = useRef(null);
  const [available, setAvailable] = useState(true);
  const toggle = useCallback(() => {
    if (context.current) return true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) { setAvailable(false); return false; }
    try {
      context.current = new AudioContext();
      context.current.resume().catch(() => setAvailable(false));
      return true;
    } catch { setAvailable(false); return false; }
  }, []);
  useEffect(() => () => {
    context.current?.close().catch(() => {});
    context.current = null;
  }, []);
  useEffect(() => {
    const ctx = context.current;
    if (!ctx || !enabled || soundName === 'quiet') return undefined;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    let source;
    let filter;
    if (soundName === 'elevator' || soundName === 'ding') {
      source = ctx.createOscillator();
      source.frequency.value = soundName === 'ding' ? 880 : 55;
      gain.gain.setValueAtTime(soundName === 'ding' ? 0.08 : 0.025, ctx.currentTime);
      source.connect(gain);
      if (soundName === 'ding') {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      }
    } else {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      gain.gain.value = soundName === 'wind_strong' ? 0.07 : 0.035;
      source.connect(filter);
      filter.connect(gain);
    }
    source.start();
    if (soundName === 'ding') source.stop(ctx.currentTime + 0.8);
    return () => {
      try { source.stop(); } catch { /* A short bell may already have stopped. */ }
      source.disconnect();
      filter?.disconnect();
      gain.disconnect();
    };
  }, [enabled, soundName]);
  return {toggle, available};
}

export function RiderExperience({onClose, intro = false}) {
  const [started, setStarted] = useState(!intro);
  const [index, setIndex] = useState(0);
  const [letters, setLetters] = useState({index: 0, count: 0});
  const [tick, setTick] = useState(0);
  const [muted, setMuted] = useState(true);
  const reduced = useReducedMotion();
  const canvas = useRef(null);
  const panel = useRef(null);
  const seg = STORY[index];
  const count = reduced ? seg.text.length : letters.index === index ? letters.count : 0;
  const typing = count < seg.text.length;
  const audio = useAmbience(started && !muted, seg.sound);
  useSceneCanvas(canvas, started ? seg.scene : null, reduced ? 0 : tick, index);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    const focus = document.activeElement;
    root.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      root.style.overflow = previous;
      if (focus?.isConnected) focus.focus({preventScroll: true});
    };
  }, []);
  useEffect(() => {
    if (reduced || !started) return undefined;
    const timer = window.setInterval(() => setTick(value => value + 1), 80);
    return () => window.clearInterval(timer);
  }, [reduced, started]);
  useEffect(() => {
    if (reduced || !started) return undefined;
    let count = 0;
    setLetters({index, count});
    const timer = window.setInterval(() => {
      count += 1;
      setLetters(previous => ({index, count: previous.index === index ? Math.max(previous.count, count) : count}));
      if (count >= seg.text.length) window.clearInterval(timer);
    }, seg.speed);
    return () => window.clearInterval(timer);
  }, [index, seg, reduced, started]);

  const next = () => {
    if (typing) setLetters({index, count: seg.text.length});
    else setIndex(value => Math.min(value + 1, STORY.length - 1));
  };
  function keys(event) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (started && event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); next(); }
    if (started && event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); setIndex(value => Math.max(0, value - 1)); }
    if (event.key === 'Tab') {
      const buttons = Array.from(panel.current.querySelectorAll('button:not(:disabled), a[href]'));
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
        event.preventDefault(); first?.focus();
      }
    }
  }
  const frame = reduced || Math.floor(tick / 4) % 2 === 0 ? RIDER_A : RIDER_B;
  return createPortal(
    <div className="journal-scope">
      <section ref={panel} className={styles.experience} role="dialog" aria-modal="true"
        aria-label="接單出發，互動閱讀" tabIndex={-1} onKeyDown={keys} data-warm={seg.scene === 'girl_scene'}>
        <header className={styles.hud}>
          <button type="button" onClick={onClose}>← 返回意識潮</button>
          <span className={styles.location}>{LOCATIONS[seg.scene]}</span>
          <button type="button" disabled={!audio.available} aria-pressed={!muted} onClick={() => {
            if (muted && !audio.toggle()) return;
            setMuted(value => !value);
          }}>{!audio.available ? '聲音無法使用' : muted ? '聲音：關' : '聲音：開'}</button>
        </header>
        {!started ? (
          <div className={`${styles.cover} ${styles.departure}`}>
            <span className={styles.coverLabel}>晚上七點 · 一個外送員的夜晚</span>
            <div className={styles.coverSprite} aria-hidden="true"><PixelSprite frame={RIDER_A} scale={5} /></div>
            <h2 className={styles.coverText}>接單出發</h2>
            <p className={styles.hint}>在主街轉進中巷，再拐進小巷的巷尾。</p>
            <button type="button" className={styles.start} onClick={() => { setStarted(true); panel.current?.focus(); }}>接下這一單 →</button>
            <p className={styles.hint}>由你推進，隨時可以折返。</p>
          </div>
        ) : <>
        <div className={styles.scene}>
          <canvas ref={canvas} width={640} height={360} className={styles.canvas} aria-hidden="true" />
          {seg.showRider ? <div className={styles.rider} aria-hidden="true"><PixelSprite frame={frame} scale={4} /></div> : null}
          {seg.showGirl ? <div className={styles.girl} aria-hidden="true"><PixelSprite frame={GIRL_A} scale={4} /></div> : null}
          <span className={styles.sceneLabel} aria-hidden="true">{seg.scene === 'elevator_inside' ? index === 9 ? '５Ｆ ↑' : '１Ｆ ↑' : seg.scene === 'floor6' ? '６Ｆ' : '接單出發'}</span>
        </div>
        <div className={styles.reading}>
          <div className={styles.dialogue}>
            <span className={styles.speaker}>{seg.showGirl ? '六樓' : '外送途中'}</span>
            <p className={styles.story} aria-hidden="true">{seg.text.slice(0, count)}<span className={styles.cursor}>{typing ? '▌' : ''}</span></p>
            <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{seg.text}</p>
          </div>
          <footer className={styles.controls}>
            <button type="button" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>← 上一段</button>
            <span className={styles.progress}>{String(index + 1).padStart(2, '0')} / {STORY.length}</span>
            {seg.isEnd && !typing ? <button type="button" onClick={() => setIndex(0)}>重新出發 ↺</button>
              : <button type="button" onClick={next}>{typing ? '顯示完整文字' : '繼續 →'}</button>}
          </footer>
          {seg.isEnd && !typing ? <p className={styles.ending}><button type="button" onClick={onClose}>返回意識潮</button></p> : null}
        </div>
        </>}
      </section>
    </div>, document.body,
  );
}

export default function PandaRider() {
  const [open, setOpen] = useState(false);
  return (
    <div className="journal-scope">
      <section className={styles.cover} aria-label="接單出發">
        <span className={styles.coverLabel}>一個外送員的夜晚 · 像素敘事</span>
        <div className={styles.coverSprite} aria-hidden="true"><PixelSprite frame={RIDER_A} scale={5} /></div>
        <p className={styles.coverText}>昨天晚上七點<br />接到一個單</p>
        <button type="button" className={styles.start} onClick={() => setOpen(true)}>接單出發 →</button>
        <p className={styles.hint}>逐段前進，隨時折返。聲音由你開啟。</p>
        <Link className={styles.return} to="/my-tide">← 返回意識潮</Link>
      </section>
      {open ? <RiderExperience onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
