'use client';

import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// 1. 核心配置 (Config)
// ============================================================================

export interface AppConfig {
  cardText: string;
  subText: string;
  particleCount: number;
  colorInner: string;
  colorOuter: string;
  particleSize: number;
  beatSpeed: number;
  bgValue: string;
  bgMusicUrl: string;
  enableSound: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  cardText: 'CYBER LOVE',
  subText: 'Digital Heartbeat',
  
  // 视觉配置
  particleCount: 20000,       
  colorInner: '#a0e0ff',      
  colorOuter: '#b020ff',      
  particleSize: 1.6,          
  beatSpeed: 1.0,             
  
  bgValue: '#020205',         
  bgMusicUrl: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/spring-cherry.mp3',
  enableSound: true,
};

export const dynamicHeartParticleConfigMetadata = {
  panelTitle: '赛博星云爱心',
  panelSubtitle: '全息数字构建',
  configSchema: {
    cardText: { category: 'content', type: 'input', label: '全息文字' },
    subText: { category: 'content', type: 'input', label: '数字寄语' },
    particleCount: { category: 'visual', type: 'slider', min: 5000, max: 30000, step: 1000, label: '数据密度' },
    particleSize: { category: 'visual', type: 'slider', min: 0.5, max: 5, step: 0.1, label: '粒子光强' },
    colorInner: { category: 'visual', type: 'color', label: '核心能级' },
    colorOuter: { category: 'visual', type: 'color', label: '外层辉光' },
    bgValue: { category: 'background', type: 'color', label: '虚空底色' },
    enableSound: { category: 'background', type: 'switch', label: '背景音乐' },
  },
  tabs: [
      { id: 'content', label: '内容', icon: null },
      { id: 'visual', label: '视觉', icon: null },
      { id: 'background', label: '背景', icon: null }
  ],
  mobileSteps: [{ id: 1, label: '定制', fields: ['cardText', 'colorOuter'] }]
};

// ============================================================================
// 2. 赛博晶体着色器 (Shader) - 整体心跳版
// ============================================================================

const CyberVertexShader = `
  uniform float uTime;
  uniform float uBeatSpeed;
  
  attribute vec3 aPositionTarget; 
  attribute vec3 aPositionStart;  
  attribute float aRandom;
  attribute float aSize;
  attribute float aColorMix; 
  
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  
  varying vec3 vColor;
  varying float vAlpha;

  float easeOutQuart(float x) {
    return 1.0 - pow(1.0 - x, 4.0);
  }

  void main() {
    // --- 汇聚动画 ---
    float gatherDuration = 3.5;
    float startDelay = aRandom * 1.2; 
    float progressRaw = (uTime - startDelay) / gatherDuration;
    float progress = clamp(progressRaw, 0.0, 1.0);
    float easeProgress = easeOutQuart(progress);

    vec3 currentPos = mix(aPositionStart, aPositionTarget, easeProgress);
    float activeState = smoothstep(0.8, 1.0, easeProgress); 
    
    // --- [核心升级] 整体同步心跳算法 ---
    // 1. 基础时间轴
    float timeCycle = uTime * uBeatSpeed * 4.0;
    
    // 2. 极微小的空间延迟 (Micro Delay)
    // 之前延迟很大(0.08)，导致只有内部在动。现在改为 0.01，几乎同步，但保留一点点有机感
    float distDelay = length(aPositionTarget) * 0.01;
    float localTime = timeCycle - distDelay;
    
    // 3. 有力的双波峰 (Strong Lub-Dub)
    // 收缩相
    float systole = pow(0.5 + 0.5 * sin(localTime), 8.0);
    // 舒张相
    float diastole = pow(0.5 + 0.5 * sin(localTime - 1.2), 8.0) * 0.5;
    
    // 4. 弹性回弹 (Elastic Recoil)
    float recoil = sin(localTime * 2.0 + 3.14) * 0.08 * systole;
    
    float heartBeatWave = (systole + diastole + recoil) * activeState;
    
    // 5. [关键修改] 整体缩放 (Global Scaling)
    // 使用乘法 scaling，让整个心形一起变大变小，而不是局部位移
    // 0.12 是膨胀系数，意味着最大膨胀 12%
    float beatScale = 1.0 + heartBeatWave * 0.12;
    
    // 应用整体缩放
    currentPos *= beatScale;
    
    // 6. 额外的 Z 轴呼吸 (Volume Breathing)
    // 让厚度变化稍微滞后一点点，增加 3D 韧性
    float zBreathing = 1.0 + sin(localTime) * 0.02 * activeState;
    currentPos.z *= zBreathing;
    
    // --- 悬浮流体 ---
    float flowFrequency = 0.8;
    float flowAmp = 0.06 * activeState;
    float flowX = sin(uTime * flowFrequency + currentPos.y + aRandom * 10.0);
    float flowY = cos(uTime * flowFrequency * 0.8 + currentPos.x + aRandom * 20.0);
    float flowZ = sin(uTime * flowFrequency * 1.2 + currentPos.z + aRandom * 30.0);
    currentPos += vec3(flowX, flowY, flowZ) * flowAmp;

    vec3 baseColor = mix(uColorInner, uColorOuter, aColorMix);
    
    // 能量闪烁：心跳收缩最强时，核心亮一度
    float beatFlash = 1.0 + systole * 1.2;
    float gatherFlash = 1.0 + sin(progress * 3.14159) * 0.5; 
    
    vColor = baseColor * gatherFlash * beatFlash;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float twinkle = 0.8 + sin(uTime * 6.0 + aRandom * 50.0) * 0.3;
    
    float distScale = (200.0 / -mvPosition.z);
    gl_PointSize = aSize * distScale * twinkle;
    
    vAlpha = 1.0; 
  }
`;

const CyberFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    
    if (dist > 0.5) discard;
    
    // 晶体核心
    float core = 1.0 - smoothstep(0.05, 0.1, dist);
    
    // 锐利光晕
    float glow = 1.0 - smoothstep(0.0, 0.45, dist);
    glow = pow(glow, 10.0); 
    
    vec3 finalColor = mix(vColor, vec3(1.0), core * 0.8);
    
    float finalAlpha = core * 1.0 + glow * 0.4;
    
    gl_FragColor = vec4(finalColor, finalAlpha * vAlpha);
  }
`;

// ============================================================================
// 3. 场景逻辑
// ============================================================================

function getHeartPosition(target: THREE.Vector3) {
  const t = Math.random() * Math.PI * 2;
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  
  const r = Math.random();
  const fill = Math.pow(r, 0.35); 
  
  x *= fill;
  y *= fill;
  
  const zThickness = 9.0 * Math.sqrt(1.0 - fill); 
  let z = (Math.random() - 0.5) * zThickness;

  target.set(x, y, z).multiplyScalar(0.35); 
  return { pos: target, mix: r };
}

function getRandomStartPosition(target: THREE.Vector3) {
  const theta = Math.random() * Math.PI * 2;
  const r = 60 + Math.random() * 40; 
  const y = (Math.random() - 0.5) * 50; 
  
  target.x = r * Math.cos(theta);
  target.z = r * Math.sin(theta);
  target.y = y;
  return target;
}

const CyberGalaxyHeart = ({ config }: { config: AppConfig }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  const attributes = useMemo(() => {
    const count = config.particleCount;
    const posTarget = new Float32Array(count * 3);
    const posStart = new Float32Array(count * 3);
    const colorMix = new Float32Array(count);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);
    const dummy = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const { pos: p, mix } = getHeartPosition(dummy);
      posTarget[i * 3] = p.x;
      posTarget[i * 3 + 1] = p.y;
      posTarget[i * 3 + 2] = p.z;
      
      getRandomStartPosition(dummy);
      posStart[i * 3] = dummy.x;
      posStart[i * 3 + 1] = dummy.y;
      posStart[i * 3 + 2] = dummy.z;
      
      colorMix[i] = mix; 
      randoms[i] = Math.random();
      
      const rSize = Math.random();
      if (rSize < 0.92) {
          sizes[i] = config.particleSize * (0.3 + Math.random() * 0.6);
      } else {
          sizes[i] = config.particleSize * (1.2 + Math.random() * 1.0);
      }
    }
    return { posTarget, posStart, colorMix, randoms, sizes };
  }, [config.particleCount, config.particleSize]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uBeatSpeed.value = config.beatSpeed;
      shaderRef.current.uniforms.uColorInner.value.set(config.colorInner);
      shaderRef.current.uniforms.uColorOuter.value.set(config.colorOuter);
    }
    if (pointsRef.current) {
        pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={attributes.posTarget.length/3} array={attributes.posTarget} itemSize={3} />
        <bufferAttribute attach="attributes-aPositionTarget" count={attributes.posTarget.length/3} array={attributes.posTarget} itemSize={3} />
        <bufferAttribute attach="attributes-aPositionStart" count={attributes.posStart.length/3} array={attributes.posStart} itemSize={3} />
        <bufferAttribute attach="attributes-aColorMix" count={attributes.colorMix.length} array={attributes.colorMix} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={attributes.randoms.length} array={attributes.randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={attributes.sizes.length} array={attributes.sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={CyberVertexShader}
        fragmentShader={CyberFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uBeatSpeed: { value: 1.0 },
          uColorInner: { value: new THREE.Color(config.colorInner) },
          uColorOuter: { value: new THREE.Color(config.colorOuter) }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

// 全息涟漪底座
const HolographicBase = ({ color }: { color: string }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(groupRef.current) {
            groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, -9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
                <ringGeometry args={[6, 6.05, 128]} />
                <meshBasicMaterial color="#a0e0ff" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, 0, -0.2]}>
                <ringGeometry args={[4, 9, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh rotation={[0, 0, 1]} position={[0,0,0.1]}>
                 <ringGeometry args={[7.5, 7.53, 128]} />
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.25} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <gridHelper args={[20, 10, 0x112244, 0x000000]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0.2]} />
        </group>
    );
}

// ============================================================================
// 4. UI 界面层 (HTML Overlay)
// ============================================================================

const CyberOverlay = ({ config }: { config: AppConfig }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
      <div className="relative mt-[42vh] text-center animate-fade-in-slow mix-blend-screen">
        <h1 
          className="text-5xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text"
          style={{ 
            fontFamily: "'Montserrat', sans-serif",
            backgroundImage: `linear-gradient(180deg, #fff 0%, ${config.colorInner} 40%, ${config.colorOuter} 100%)`,
            filter: 'drop-shadow(0 0 10px rgba(160, 224, 255, 0.6)) drop-shadow(0 0 30px rgba(176, 32, 255, 0.4))',
            WebkitBackgroundClip: 'text',
            letterSpacing: '0.2em'
          }}
        >
          {config.cardText}
        </h1>
        
        <div className="inline-block mt-6 px-4 py-1 border border-blue-400/30 bg-blue-900/10 backdrop-blur-sm rounded-full">
            <p 
            className="text-xs md:text-sm tracking-[0.5em] font-medium text-cyan-200"
            style={{ textShadow: `0 0 8px ${config.colorInner}` }}
            >
            {config.subText.toUpperCase()}
            </p>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[10px] text-cyan-100/30 tracking-[0.4em] font-light uppercase">
        System Online • Interactive
      </div>
    </div>
  );
};

// ============================================================================
// 5. 主入口
// ============================================================================

const CameraRig = () => {
    const { camera, mouse } = useThree();
    useFrame(() => {
        camera.position.x += (mouse.x * 2.5 - camera.position.x) * 0.03;
        camera.position.y += (mouse.y * 2.5 - camera.position.y) * 0.03;
        camera.lookAt(0, -1, 0); 
    });
    return null;
}

export const DisplayUI = ({ 
  config = DEFAULT_CONFIG, 
  isPanelOpen = false 
}: { 
  config?: AppConfig 
  isPanelOpen?: boolean
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !config.enableSound) return;
    const audio = new Audio(config.bgMusicUrl);
    audio.loop = true;
    audio.volume = 0.4;
    const play = () => { audio.play().catch(() => {}); document.removeEventListener('click', play); };
    document.addEventListener('click', play);
    return () => { audio.pause(); document.removeEventListener('click', play); };
  }, [mounted, config.bgMusicUrl, config.enableSound]);

  if (!mounted) return <div className="w-full h-full bg-black" />;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-black overflow-hidden">
      <CyberOverlay config={config} />

      <Canvas 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 22], fov: 38 }} 
        gl={{ 
            antialias: true, 
            alpha: false, 
            powerPreference: "high-performance" 
        }}
      >
        <Suspense fallback={null}>
            <color attach="background" args={[config.bgValue]} />
            <fog attach="fog" args={[config.bgValue, 15, 90]} /> 
            
            <ambientLight intensity={0.1} />

            <CyberGalaxyHeart config={config} />
            
            <HolographicBase color={config.colorOuter} />

            <Stars radius={120} depth={20} count={1500} factor={3} saturation={0} fade speed={0.5} />
            
            <CameraRig />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} maxPolarAngle={Math.PI/1.6} minPolarAngle={Math.PI/2.5}/>
        </Suspense>
      </Canvas>
    </div>
  );
};

if (typeof document !== 'undefined') {
  const style = document.createElement("style");
  style.innerText = `
    @keyframes fade-in-slow {
      0% { opacity: 0; transform: translateY(30px) scale(0.9); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-fade-in-slow {
      animation: fade-in-slow 4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      animation-delay: 1.5s; /* 配合粒子汇聚时间 */
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}
export default function Demo4Page() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}