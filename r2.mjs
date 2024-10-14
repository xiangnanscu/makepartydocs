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
const nameMapPath = path.join(outputDir, 'name.json');
let nameMap = {};
if (fs.existsSync(nameMapPath)) {
  nameMap = JSON.parse(await fs.promises.readFile(nameMapPath, 'utf-8'));
}
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

      await upload.done();
      console.log(`${filePath} => ${fileName}`);
      nameMap[file] = `https://r2.xnscu.com/${uuidName}${ext}`;
      await fs.promises.writeFile(nameMapPath, JSON.stringify(nameMap, null, 2));
    }
  }
}

// 启动上传

uploadFiles(outputDir)
  .then(() => console.log('All files uploaded successfully'))
  .catch(err => console.error('Error uploading files:', err));