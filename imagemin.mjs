import imagemin from "imagemin-keep-folder";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import fs from "fs";
import path from "path";

let dirPath = "small/";
// let dirPath = "wp-content/themes/theme/img/small";

// 見やすくフォーマットする
function formatFileSize(size) {
  const units = ["bytes", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return Math.ceil(size) + " " + units[unitIndex];
}

// 処理前のファイルサイズを取得
let before_size = [];
function logFiles(dirPath) {
  const files = fs.readdirSync(dirPath);

  // ファイルとディレクトリを順番に処理する
  for (const file of files) {
    // ファイルのパスを取得する
    const filePath = path.join(dirPath, file);
    // ファイルのステータスを取得する
    const stats = fs.statSync(filePath);
    // ファイルの場合はログに表示する
    if (stats.isFile()) {
      let extension = [".jpg", ".png"];
      if (extension.includes(path.extname(filePath))) {
        before_size.push(formatFileSize(fs.statSync(filePath).size));
      }
    } else if (stats.isDirectory()) {
      // ディレクトリの場合は再帰的に処理する
      logFiles(filePath);
    }
  }
}
logFiles(dirPath);

// ファイルを圧縮する
const files = await imagemin([`${dirPath}**/*.{jpg,png}`], {
  plugins: [
    imageminMozjpeg({
      quality: 80,
    }),
    imageminPngquant({
      quality: [0.8, 1.0],
    }),
  ],
});

// 処理後のサイズを表示
files.forEach((element, index) => {
  let fileSize = formatFileSize(fs.statSync(element.path).size);
  let filename = /([^/]*?)$/.exec(element.path);
  console.log(`${filename[0]}     ${before_size[index]} => ${fileSize}`);
});
