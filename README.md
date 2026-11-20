# 💉 SQLi Tester — Bruce / LilyGO T-Embed CC1101

<p align="center">🇺🇸 <b>English</b> · 🇫🇷 <a href="README.fr.md">Français</a></p>

[![Bruce firmware](https://img.shields.io/badge/firmware-Bruce-8A2BE2?logo=github)](https://github.com/BruceDevices/firmware) [![Device](https://img.shields.io/badge/device-LilyGO%20T--Embed%20CC1101-1E90FF)](https://github.com/BruceDevices/firmware) [![Language](https://img.shields.io/badge/script-JavaScript%20(BJS)-F7DF1E)](https://github.com/BruceDevices/firmware) [![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A small **SQL-injection tester** for the Bruce JS interpreter. Point it at a URL with a parameter, and it runs error-based, time-based (blind) and boolean-based checks against a clean baseline — right from the device, with a clean picto UI. Targets are read from an editable `sqli_targets.txt`.

![SQLi Tester](docs/hero.jpg)

## ⚠️ Legal

**For authorized security testing only.** Use it exclusively on **your own** servers or targets you have **explicit written permission** to test (the bundled `testphp/testasp.vulnweb.com` are public, intentionally-vulnerable practice sites). Testing systems without authorization is illegal.

## ✨ Features

- 🎯 **Target menu from a file** — pick a target directly from `sqli_targets.txt` (label + URL), or type one manually. No long typing on the device.
- 🔎 **3 detection methods** over a clean baseline request:
  - **error-based** — a DB error string appears that wasn't in the baseline
  - **time-based (blind)** — a `SLEEP()/WAITFOR` payload makes the response ~3 s slower
  - **boolean-based** — `AND 1=1` vs `AND 1=2` give clearly different responses
- 🔗 **Exact test URL in the report** — every finding shows the precise (URL-encoded) request that triggered it, ready to reproduce in a browser or `curl`.
- 🎨 **Picto UI** — animated scanning screen (magnifier + radar + progress + live hit counter), flicker-free scrollable report.

| Menu | Targets | Scanning | Result |
|---|---|---|---|
| ![menu](docs/menu.jpg) | ![targets](docs/targets.jpg) | ![scanning](docs/scanning.jpg) | ![vulnerable](docs/vulnerable.jpg) |

## 🚀 Install

1. Copy **`SQL Injection.js`** and **`sqli_targets.txt`** onto the SD card (e.g. into `/scripts`, or the SD root for the targets file).
2. On the device: **JS Interpreter → select `SQL Injection.js`** (or add it to your favorites with [bruce-launcher](https://github.com/koua29/bruce-launcher)).
3. **Rotate** = move, **click** = select/scan, **long-press (ESC)** or **click** = back.

**Add your own targets** — just edit `sqli_targets.txt`, one per line:
```
label | http://host/page.php?id=1
```
The payload is appended to the **end** of the URL, so end it on the **parameter value** you want to test. If the file is missing, three built-in demo targets are used.

## 🛠️ How it works

Bruce's JS interpreter exposes **no raw TCP socket** and **no `encodeURIComponent`** — only `wifi.httpFetch()`. So the tool URL-encodes payloads by hand, sends plain HTTP requests, and compares each response to a baseline (status code, body length, response time, and DB-error signatures).

## ⚠️ Limitations

- **HTTPS/TLS** targets are probed as plain HTTP and usually can't be read reliably.
- The public `vulnweb.com` practice hosts go up/down often — *"baseline request failed / connection refused"* usually means **that host is down**, not a bug. Try another, or self-host a lab (DVWA, SQLi-Labs, bWAPP) over HTTP for reliable practice.
- This is a **first-pass detector**, not a full exploitation framework. Confirm findings with a real tool on an authorized target.

## 🛒 Hardware

*Amazon affiliate links: if you buy through these links, the project earns a small commission at no extra cost to you.*

<table>
<tr>
<td align="center" width="33%">
  <a href="https://www.amazon.com/dp/B0D45MSMJR?linkCode=ll2&amp;tag=koua29bsqlitester-20&amp;ref_=as_li_ss_tl"><img src="docs/amazon-B0D45MSMJR.jpg" width="200" alt="Anker 545 power bank (10,000 mAh)"></a><br>
  <b><a href="https://www.amazon.com/dp/B0D45MSMJR?linkCode=ll2&amp;tag=koua29bsqlitester-20&amp;ref_=as_li_ss_tl">Anker 545 power bank (10,000 mAh)</a></b><br><sub>Keeps the T-Embed running away from an outlet</sub>
</td>
<td align="center" width="33%">
  <a href="https://www.amazon.com/dp/B0C1FCZM94?linkCode=ll2&amp;tag=koua29bsqlitester-20&amp;ref_=as_li_ss_tl"><img src="docs/amazon-B0C1FCZM94.jpg" width="200" alt="433 MHz SMA antenna (2-pack)"></a><br>
  <b><a href="https://www.amazon.com/dp/B0C1FCZM94?linkCode=ll2&amp;tag=koua29bsqlitester-20&amp;ref_=as_li_ss_tl">433 MHz SMA antenna (2-pack)</a></b><br><sub>Sub-GHz antenna for the CC1101 radio</sub>
</td>
<td align="center" width="33%">
  <a href="https://www.amazon.com/dp/B0B7NVMBPL?linkCode=ll2&amp;tag=koua29bsqlitester-20&amp;ref_=as_li_ss_tl"><img src="docs/amazon-B0B7NVMBPL.jpg" width="200" alt="SanDisk 64 GB microSD (2-pack)"></a><br>
  <b><a href="https://www.amazon.com/dp/B0B7NVMBPL?linkCode=ll2&amp;tag=koua29bsqlitester-20&amp;ref_=as_li_ss_tl">SanDisk 64 GB microSD (2-pack)</a></b><br><sub>For Bruce themes, scripts and captures</sub>
</td>
</tr>
</table>

<sub>As an Amazon Associate I earn from qualifying purchases.</sub>

## 🙏 Credits & License

- Script: **koua29**. Runs on the excellent **[Bruce firmware](https://github.com/BruceDevices/firmware)**.
- Released under the **MIT License** — see [LICENSE](LICENSE).

## ☕ Coffee?

<img src="docs/paypal-qr.png" width="170" alt="PayPal" />
