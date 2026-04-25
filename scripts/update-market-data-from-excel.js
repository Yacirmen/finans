import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as XLSX from "xlsx";

const root = process.cwd();
const inputPath = path.join(root, "data", "market-upload.xlsx");
const outputPath = path.join(root, "data", "market-data.json");

if (!fs.existsSync(inputPath)) {
  console.error("Excel bulunamadı: data/market-upload.xlsx");
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const normalized = rows
  .map((row) => {
    const source = row;
    const label = String(source.label || source.Label || source.Gosterge || source.Gösterge || "").trim();
    if (!label) return null;

    const directionRaw = String(source.direction || source.Direction || source.Yon || source.Yön || "flat").toLowerCase();
    const direction = directionRaw.includes("up") || directionRaw.includes("yukari") || directionRaw.includes("yukarı")
      ? "up"
      : directionRaw.includes("down") || directionRaw.includes("asagi") || directionRaw.includes("aşağı")
        ? "down"
        : "flat";

    return {
      label,
      value: String(source.value || source.Value || source.Deger || source.Değer || "").trim(),
      change: String(source.change || source.Change || source.Degisim || source.Değişim || "").trim(),
      direction,
      type: String(source.type || source.Type || source.Tip || "market").trim(),
      sparkline: String(source.sparkline || source.Sparkline || "")
        .split(/[;,]/)
        .map((value) => Number(String(value).trim().replace(",", ".")))
        .filter(Number.isFinite),
    };
  })
  .filter(Boolean);

if (!normalized.length) {
  console.error("Excel içinde okunabilir piyasa satırı bulunamadı.");
  process.exit(1);
}

fs.writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
console.log(`${normalized.length} piyasa göstergesi ${outputPath} dosyasına yazıldı.`);
