uniform float uTime;
  uniform float uBeatSpeed;
  uniform float uGatherTime; // 汇聚所需时间
  
  attribute vec3 aPositionTarget; // 目标位置(心形)
  attribute float aRandom;        // 随机因子
  attribute float aSize;          // 粒子大小
  attribute vec3 aColor;          // 颜色
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vProgress; // 传递进度给片段着色器

  void main() {
    vColor = aColor;
    
    // 1. 从容优雅的汇聚动画控制 (从 0 到 1)
    // 更大的随机延迟,让粒子像流星雨般错落有致地飞来
    float startDelay = aRandom * 7.0; // 延长到7秒,制造梦幻的波浪式抵达
    float rawProgress = (uTime - startDelay) / uGatherTime;
    
    // 四次贝塞尔曲线缓动,营造极致柔美的加速曲线
    float progress = smoothstep(0.0, 1.0, rawProgress);
    progress = progress * progress * progress * (progress * (progress * 6.0 - 15.0) + 10.0); // Smootherstep++
    vProgress = clamp(progress, 0.0, 1.0);
    
    // 2. 诗意的螺旋飞舞轨迹
    vec3 currentPos = position;
    
    // 三维螺旋轨迹:星辰在引力牵引下优雅地螺旋下降
    if (vProgress > 0.0 && vProgress < 1.0) {
      // 主螺旋角度 - 顺时针或逆时针由随机数决定
      float direction = (aRandom > 0.5 ? 1.0 : -1.0);
      float spiralAngle = vProgress * 3.14159 * 6.0 * direction; // 增加旋转圈数到6圈
      
      // 螺旋半径 - 缓慢收缩,营造被吸引的视觉效果
      float spiralRadius = pow(1.0 - vProgress, 1.8) * 8.0; // 使用幂函数让收缩更从容
      
      // XZ平面的螺旋运动
      currentPos.x += cos(spiralAngle) * spiralRadius;
      currentPos.z += sin(spiralAngle) * spiralRadius;
      
      // Y轴的波浪起伏 - 模拟星辰在宇宙中的优雅滑行
      float waveY = sin(vProgress * 3.14159 * 2.0) * 3.0 * (1.0 - vProgress);
      currentPos.y += waveY;
    }
    
    vec3 newPos = mix(currentPos, aPositionTarget, vProgress);