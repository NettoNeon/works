import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

let dirPath = "works/";
const jsonData = [];

function mdFiles(dirPath) {
  const files = fs.readdirSync(dirPath);

  // ファイルとディレクトリを順番に処理する
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      let extension = [".md"];
      if (extension.includes(path.extname(filePath))) {
        // .mdのみを処理
        ParseMd(filePath);
      }
    } else if (stats.isDirectory()) {
      // ディレクトリの場合は再帰的に処理する
      mdFiles(filePath);
    }
  }
}
mdFiles(dirPath);

function ParseMd(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const dom = new JSDOM(content);
  const doc = dom.window.document;

  const data = {
    title: "",
    description: "",
    date: "",
    link: "",
    article: "",
    images: [],
  };

  data.title = extractDirectoryName(filePath).replace(".md", "");
  data.description = doc.getElementsByClassName("description")[0]?.innerHTML || null;
  data.date = doc.getElementsByClassName("date")[0]?.innerHTML || null;
  data.link = doc.getElementsByClassName("link")[0]?.innerHTML || null;
  data.article = doc.getElementsByClassName("article")[0]?.innerHTML || null;
  data.images = extractImages(doc);

  function extractDirectoryName(filePath) {
    // パスを区切る
    const parts = filePath.split(path.sep);
    // `works` の次のディレクトリを取得
    return parts.length > 1 ? parts[1] : "";
  }

  function extractImages(doc) {
    const images = doc.getElementsByTagName("img");
    if (images) {
      return Array.from(images).map((element) => ({
        src: dirPath + element.getAttribute("src").replace(/.\//, "") || "",
        class: element.getAttribute("class") || "",
      }));
    }
  }

  // mdファイルの中身をコンソールに表示
  console.log(`--- ${filePath} ---`);
  console.log(data);
  console.log("-------------------\n");

  jsonData.push(data);
}

function saveJsonToFile(jsonData, fileName = "works.json") {
  // `YYYY/MM/DD`のフォーマットを統一してソート
  jsonData.sort((a, b) => {
    const dateA = new Date(a.date.replace(/[\/.]/g, "-"));
    const dateB = new Date(b.date.replace(/[\/.]/g, "-"));
    return dateB - dateA;
  });

  const content = JSON.stringify(jsonData);
  fs.writeFile(`json/${fileName}`, content, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`JSONファイルを生成しました`);
    }
  });
}

// jsonDataをworks.jsonとして書き出す
saveJsonToFile(jsonData);
