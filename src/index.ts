import { readFileSync } from "node:fs";
import { main } from "./main.js";

const inputPath = process.argv[2] ?? "input.txt";
const input = readFileSync(inputPath, "utf8").replace(/\r/g, "");

main(input);
