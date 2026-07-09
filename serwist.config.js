// @ts-check
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { serwist } from "@serwist/next/config";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  randomUUID();

/** @type {import("@serwist/next/config").SerwistConfig} */
export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});
