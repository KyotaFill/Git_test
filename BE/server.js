import { createServer } from "node:http";
import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
const server = createServer(createApp());

server.listen(port, () => {
  console.log(`Task Board đang chạy tại http://localhost:${port}`);
});

