// 生成指定范围内的随机整数 [min, max]
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成指定范围内的随机浮点数 [min, max)
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}