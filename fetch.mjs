/* 덥냐? — 기온을 한 번만 받아 data.json으로 굳힙니다.
   사용자가 몇 명이든 원본 API 호출량은 이 스크립트가 도는 횟수로 고정됩니다.

   교체할 때: fetchAll() 안쪽만 다른 공급자로 바꾸면 됩니다.
   앱은 data.json의 모양만 보므로 손댈 필요 없습니다. */

import { writeFileSync } from "node:fs";
import { WORLD, KOREA } from "./cities.mjs";

const BATCH = 40;                       // 한 요청에 좌표 40개
const UA = "dupnya/1.0 (+https://github.com/inte-resting/dupnya)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 세계와 한국을 한 배열로 붙여서 부르고, 결과는 인덱스로 다시 가릅니다.
   따로 부르면 6요청, 붙여 부르면 5요청. 하루 720콜. */
async function fetchAll(list) {
  const temps = new Array(list.length).fill(null);
  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH);
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + chunk.map((c) => c[1]).join(",") +
      "&longitude=" + chunk.map((c) => c[2]).join(",") +
      "&current=temperature_2m";
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error("HTTP " + res.status + " at batch " + i);
    const json = await res.json();
    const rows = Array.isArray(json) ? json : [json];
    rows.forEach((r, k) => {
      const t = r && r.current && r.current.temperature_2m;
      if (typeof t === "number") temps[i + k] = t;
    });
    if (i + BATCH < list.length) await sleep(400);
  }
  return temps;
}

const all = [...WORLD, ...KOREA];
const temps = await fetchAll(all);

const slice = (cities, offset) =>
  cities.map((c, k) => [c[0], temps[offset + k]]).filter((r) => r[1] !== null);

const out = {
  at: new Date().toISOString(),
  world: slice(WORLD, 0),
  korea: slice(KOREA, WORLD.length),
};

/* 절반 넘게 비면 쓰지 않고 실패시킵니다. 직전 data.json이 그대로 남는 편이 낫습니다. */
if (out.world.length < WORLD.length * 0.8 || out.korea.length < KOREA.length * 0.8) {
  throw new Error("too few results: " + out.world.length + "/" + out.korea.length);
}

writeFileSync("data.json", JSON.stringify(out));
console.log("ok", out.world.length, "world,", out.korea.length, "korea");
