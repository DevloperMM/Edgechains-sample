import { ArakooServer } from "@arakoodev/edgechains.js/arakooserver";
import { PdfLoader } from "@arakoodev/edgechains.js/document-loader";
import Jsonnet from "@arakoodev/jsonnet";
import path from "path";
import fileURLToPath from "file-uri-to-path";
//@ts-ignore
import createClient from "sync-rpc";

const jsonnet = new Jsonnet();
const server = new ArakooServer();
const app = server.createApp();
const __dirname = fileURLToPath(import.meta.url);
const openAIcall = createClient(path.join(__dirname, "../lib/openAI.cjs"));

app.post("/", async (option) => {
  const { prompt, company, file } = await option.req.parseBody();
  if (!(prompt && company && file)) {
    throw new Error("Missing fields");
  }

  // @ts-ignore
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const loader = new PdfLoader(buffer);
  const docs = await loader.loadPdf();

  if (typeof prompt !== "string" || typeof company !== "string") {
    throw new Error("Invalid type for 'prompt': Expected a string");
  }

  const jsonStr = JSON.stringify(docs);
  const str = JSON.parse(jsonStr);
  const user = str.split("\n").filter((item: string) => item.trim() !== "");

  jsonnet.extString("username", JSON.stringify(user[0]));
  jsonnet.extString("promptMsg", prompt);
  jsonnet.extString("company", company);
  jsonnet.javascriptCallback("openAIcall", openAIcall);

  let details = jsonnet.evaluateFile(
    path.join(__dirname, "../../jsonnet/main.jsonnet")
  );

  return option.json(details);
});

server.listen(3000);
