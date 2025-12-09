import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
	fs.mkdirSync(screenshotsDir, { recursive: true });
}

app.use('/screenshots', express.static(screenshotsDir));

app.post('/api/compare', async (req, res) => {
	const { urlA, urlB, viewport } = req.body || {};

	if (!urlA || !urlB) {
		return res.status(400).json({ error: 'Both urlA and urlB are required.' });
	}

	const width = viewport?.width || 1280;
	const height = viewport?.height || 720;

	const timestamp = Date.now();
	const fileA = path.join(screenshotsDir, `a-${timestamp}.png`);
	const fileB = path.join(screenshotsDir, `b-${timestamp}.png`);
	const fileDiff = path.join(screenshotsDir, `diff-${timestamp}.png`);

	const scrollToLoadImages = async (page) => {
		await page.evaluate(async () => {
			await new Promise((resolve) => {
				let totalHeight = 0;
				const distance = 100;
				const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					totalHeight += distance;

					if (totalHeight >= scrollHeight) {
						clearInterval(timer);
						resolve();
					}
				}, 100);
			});
		});

		await page.waitForTimeout(1500);

		await page.evaluate(() => {
			return Promise.all(
				Array.from(document.images)
					.filter((img) => !img.complete)
					.map(
						(img) =>
							new Promise((resolve) => {
								img.addEventListener('load', resolve);
								img.addEventListener('error', resolve);
								setTimeout(resolve, 5000);
							})
					)
			);
		});

		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(500);
	};

	let browser;
	try {
		browser = await chromium.launch();
		const context = await browser.newContext({ viewport: { width, height } });
		const page = await context.newPage();

		await page.goto(urlA, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1000);
		await scrollToLoadImages(page);
		await page.screenshot({ path: fileA, fullPage: true });

		await page.goto(urlB, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1000);
		await scrollToLoadImages(page);
		await page.screenshot({ path: fileB, fullPage: true });

		const imgA = PNG.sync.read(fs.readFileSync(fileA));
		const imgB = PNG.sync.read(fs.readFileSync(fileB));

		const widthMin = Math.min(imgA.width, imgB.width);
		const heightMin = Math.min(imgA.height, imgB.height);

		const crop = (img) => {
			if (img.width === widthMin && img.height === heightMin) return img;

			const out = new PNG({ width: widthMin, height: heightMin });
			PNG.bitblt(img, out, 0, 0, widthMin, heightMin, 0, 0);
			return out;
		};

		const croppedA = crop(imgA);
		const croppedB = crop(imgB);
		const diff = new PNG({ width: widthMin, height: heightMin });

		const mismatchPixels = pixelmatch(croppedA.data, croppedB.data, diff.data, widthMin, heightMin, {
			threshold: 0.1,
		});

		const totalPixels = widthMin * heightMin;
		const mismatchPercentage = (mismatchPixels / totalPixels) * 100;

		fs.writeFileSync(fileDiff, PNG.sync.write(diff));

		const toPublicPath = (absPath) => {
			return '/screenshots/' + path.basename(absPath);
		};

		res.json({
			urlA,
			urlB,
			viewport: { width: widthMin, height: heightMin },
			mismatchPixels,
			totalPixels,
			mismatchPercentage,
			similarityPercentage: 100 - mismatchPercentage,
			screenshotAPath: toPublicPath(fileA),
			screenshotBPath: toPublicPath(fileB),
			diffImagePath: toPublicPath(fileDiff),
		});
	} catch (error) {
		console.error('Error in /api/compare:', error);
		res.status(500).json({ error: 'Failed to compare screenshots.' });
	} finally {
		if (browser) {
			await browser.close();
		}
	}
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
