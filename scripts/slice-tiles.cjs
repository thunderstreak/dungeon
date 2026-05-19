// 切割 BasicDungeonPack 精灵图为单独瓦片
// 用法: node scripts/slice-tiles.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '../src/assets/sprites/BasicDungeonPack');
const OUT_DIR = path.join(__dirname, '../public/tiles');

// 精灵图配置: [文件名, 列数, 行数, 输出前缀]
const SHEETS = [
  ['1.FloorTiles.png',          6, 2, 'floor'],
  ['2.WallTiles.png',           5, 3, 'wall'],
  ['3.WallCorners.png',         3, 3, 'corner'],
  ['4.WallEdges.png',           4, 3, 'edge'],
  ['5.DoorsAndEntrances.png',   3, 3, 'door'],
  ['6.FloorDetails.png',        5, 4, 'detail'],
  ['7.PillarsAndSupports.png',  4, 3, 'pillar'],
  ['8.TrapAndSpecialTiles.png', 3, 3, 'trap'],
];

// 使用 sips (macOS 内置) 获取图片尺寸
function getImageSize(filePath) {
  const result = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { encoding: 'utf-8' });
  const width = parseInt(result.match(/pixelWidth:\s+(\d+)/)[1]);
  const height = parseInt(result.match(/pixelHeight:\s+(\d+)/)[1]);
  return { width, height };
}

// 使用 sips 裁切图片
function cropImage(src, out, x, y, w, h) {
  // sips 裁切格式: sips -c height width --cropOffset top left src --out dst
  execSync(`sips -c ${h} ${w} --cropOffset ${y} ${x} "${src}" --out "${out}"`, { encoding: 'utf-8' });
}

// 检测内容起始 Y (跳过标题栏)
function detectContentStartY(filePath, imgWidth, imgHeight) {
  // 读取文件的原始像素数据太复杂，用固定偏移量
  // 根据目测，标题栏约 80-100px 高
  return 95;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [filename, cols, rows, prefix] of SHEETS) {
  const srcPath = path.join(SRC_DIR, filename);
  if (!fs.existsSync(srcPath)) {
    console.log(`跳过: ${filename} 不存在`);
    continue;
  }

  const { width, height } = getImageSize(srcPath);
  const startY = detectContentStartY(srcPath, width, height);
  const contentHeight = height - startY;

  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(contentHeight / rows);

  console.log(`${filename}: ${width}x${height}, 网格 ${cols}x${rows}, 每格 ${cellW}x${cellH}, 起始Y=${startY}`);

  let idx = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellW;
      const y = startY + row * cellH;
      const outPath = path.join(OUT_DIR, `${prefix}_${String(idx).padStart(2, '0')}.png`);

      try {
        cropImage(srcPath, outPath, x, y, cellW, cellH);
        console.log(`  ${prefix}_${String(idx).padStart(2, '0')}.png (${x}, ${y}, ${cellW}x${cellH})`);
      } catch (e) {
        console.error(`  失败: ${prefix}_${idx} - ${e.message}`);
      }
      idx++;
    }
  }
}

console.log(`\n完成! 瓦片已输出到 ${OUT_DIR}`);
