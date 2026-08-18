// i know this is a bad practice but i am in a hurry so will fix it later :( 
// no time to mess with monorepos

const serverZodFile = "./server/src/types/zod.ts";
const clientZodFile = "./client/src/types/zod.ts";

import fs from "fs";

if (fs.existsSync(serverZodFile) && fs.existsSync(clientZodFile)) {
  const serverZodContent = fs.readFileSync(serverZodFile, "utf-8");
  fs.writeFileSync(clientZodFile, serverZodContent);
  console.log("Zod schemas synced from server to client.");
} else {
  console.error("One or both of the specified files do not exist.");
}