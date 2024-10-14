import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import https from 'https'

// 设置环境变量
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME; // 替换为你的R2桶名

// 初始化S3客户端
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  tls: true,
  httpOptions: {
    agent: new https.Agent({
      secureProtocol: 'TLSv1_2_method'
    })
  }
});

const extentios = {
  '.txt': 'text/plain',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
}

const outputDir = './output';
// 记录映射关系
const successFiles = path.join(outputDir, 'success.json');
const errorFiles = path.join(outputDir, 'error.json');
let successMap = {};
if (fs.existsSync(successFiles)) {
  successMap = JSON.parse(await fs.promises.readFile(successFiles, 'utf-8'));
}
let errorMap = {};
if (fs.existsSync(errorFiles)) {
  errorMap = JSON.parse(await fs.promises.readFile(errorFiles, 'utf-8'));
}
let ok = 0
let fail = 0
// 递归遍历文件夹并上传文件
async function uploadFiles(dir) {
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    const ext = path.extname(file)
    if (stat.isDirectory()) {
      await uploadFiles(filePath); // 递归处理子文件夹
    } else if (extentios[ext]) {
      const fileStream = fs.createReadStream(filePath);
      const uuidName = uuidv4();
      const fileName = `${uuidName}${ext}`
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
      };
      const upload = new Upload({
        client: s3Client,
        params,
      });
      if (successMap[file]) {
        console.log(`文件已存在,跳过: ${file}`)
        continue
      }
      console.log(`开始上传: ${file}`);

      upload.on('httpUploadProgress', (progress) => {
        const percentComplete = Math.round((progress.loaded / progress.total) * 100);
        console.log(`${file} 上传进度: ${percentComplete}%`);
      });

      try {
        await upload.done();
        ok++
        console.log(`${file} 上传完成: ${filePath} => ${fileName}`);
        successMap[file] = `https://r2.xnscu.com/${fileName}`;
        await fs.promises.writeFile(successFiles, JSON.stringify(successMap, null, 2));
      } catch (error) {
        fail++
        console.error(`上传 ${file} 时发生错误:`, error.message);
        errorMap[file] = error.message
        await fs.promises.writeFile(errorFiles, JSON.stringify(errorMap, null, 2));
      }
    }
  }
}

// 启动上传
uploadFiles(outputDir)
  .then(() => console.log(`所有文件处理完毕,成功:${ok}, 失败:${fail}`))
  .catch(err => console.error('上传文件时出错:', err));