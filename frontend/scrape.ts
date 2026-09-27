import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as cheerio from "cheerio";

const URL = "https://ssk.gov.in/ssk2026PS";
const MIN_RECORDS = 200;

// UTF-8 mojibake fixes
const MOJIBAKE_FIX: Record<string, string> = {
  "\u00e2\u20ac\u201c": "\u2013",
  "\u00e2\u20ac\u201d": "\u2014",
  "\u00e2\u20ac\u2122": "\u2019",
  "\u00e2\u20ac\u02dc": "\u2018",
  "\u00e2\u20ac\u0153": "\u201c",
  "\u00e2\u20ac\u0152": "\u201d",
  "\u00e2\u20ac\u00a6": "\u2026",
  "\u00c2\u00b0": "\u00b0",
  "\u00c2\u00b5": "\u00b5",
  "\u00c2\u00b7": "\u00b7",
  "\u00c3\u00b1": "\u00f1",
  "\u00c3\u00a0": "\u00e0",
  "\u00c3\u00a9": "\u00e9",
};
const PUNCTUATION_FIX: Record<string, string> = {
  "\u2014": "-",
};

function fixText(text: string): string {
  let fixed = text;
  for (const [bad, good] of Object.entries(MOJIBAKE_FIX)) {
    fixed = fixed.replaceAll(bad, good);
  }
  for (const [bad, good] of Object.entries(PUNCTUATION_FIX)) {
    fixed = fixed.replaceAll(bad, good);
  }
  return fixed;
}

function fetchHtml(url: string): string {
  console.log(`Fetching ${url} using curl...`);
  try {
    const output = execSync(`curl -sS -L --compressed -H "User-Agent: Mozilla/5.0" ${url}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    return output;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}. Ensure curl is installed.`);
  }
}

function parse(htmlText: string) {
  const $ = cheerio.load(htmlText);
  const table = $("table#dataTablePS");
  if (!table.length) {
    throw new Error("Could not find #dataTablePS in the page.");
  }

  const records: any[] = [];
  const today = new Date().toISOString().split("T")[0];

  table.find("tbody tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length < 8) return;

    const titleCell = $(tds[2]);
    const link = titleCell.find("a");
    const title = fixText(link.length ? link.text().trim() : titleCell.text().trim());

    const modal = titleCell.find("div[id^='ViewProblemStatement']");
    let desc = "", department = "", datasetLink = "", contact = "", youtube = "";

    if (modal.length) {
      modal.find("tr").each((_, trow) => {
        const th = $(trow).find("th").text().trim();
        const td = $(trow).find("td");
        
        if (th === "Description") {
          const div = td.find("div.style-2");
          desc = fixText((div.length ? div.text() : td.text()).trim());
        } else if (th === "Department") {
          department = fixText(td.text().trim());
        } else if (th === "Dataset Link") {
          datasetLink = fixText(td.text().trim());
        } else if (th === "Contact info") {
          contact = fixText(td.text().trim());
        } else if (th === "Youtube Link") {
          youtube = fixText(td.text().trim());
        }
      });
    }

    const rawDeadline = fixText($(tds[7]).text().trim());

    records.push({
      sno: parseInt($(tds[0]).text().trim(), 10),
      ps_number: fixText($(tds[4]).text().trim()),
      title,
      org: fixText($(tds[1]).text().trim()),
      department,
      category: fixText($(tds[3]).text().trim()),
      theme: fixText($(tds[6]).text().trim()),
      deadline: rawDeadline,
      ideas: fixText($(tds[5]).text().trim()),
      dataset_link: datasetLink,
      contact,
      youtube,
      description: desc,
      scraped_at: today,
    });
  });

  return records;
}

function main() {
  const args = process.argv.slice(2);
  let htmlText = "";

  const cacheIndex = args.indexOf("--cache");
  if (cacheIndex !== -1 && args[cacheIndex + 1]) {
    console.log("Using cached HTML file...");
    htmlText = fs.readFileSync(args[cacheIndex + 1], "utf-8");
  } else {
    htmlText = fetchHtml(URL);
  }

  const records = parse(htmlText);

  if (records.length < MIN_RECORDS) {
    console.error(`Parsed only ${records.length} records. Expected >= ${MIN_RECORDS}`);
    process.exit(1);
  }

  const outPath = path.join(__dirname, "src/data/ps.json");
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2), "utf-8");
  
  console.log(`Successfully scraped ${records.length} problem statements.`);
  console.log(`Data saved to ${outPath}`);
}

main();
