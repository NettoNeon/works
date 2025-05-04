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

  // jsonDataをworks.jsonとして書き出す
  saveJsonToFile(jsonData);
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

  data.title = extractDirectoryName(filePath);
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
        src: element.getAttribute("src") || "",
        class: element.getAttribute("class") || "",
      }));
    }
  }

  // console.log(doc.getElementsByClassName("description")[0]);
  // mdファイルの中身をコンソールに表示
  console.log(`--- ${filePath} ---`);
  console.log(data);
  console.log("-------------------\n");

  jsonData.push(data);
}

function saveJsonToFile(jsonData, fileName = "works.json") {
  const content = JSON.stringify(jsonData);
  fs.writeFile(`${dirPath}${fileName}`, content, (err) => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });
  console.log(`JSONファイルを生成しました`);
}
