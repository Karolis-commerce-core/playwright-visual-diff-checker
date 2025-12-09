import { useState } from 'react';
import ReactCompareImage from 'react-compare-image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';

const DEVICE_PRESETS = {
	desktop: { width: 1920, height: 1080, label: 'Desktop (1920×1080)' },
	laptop: { width: 1280, height: 720, label: 'Laptop (1280×720)' },
	ipad: { width: 768, height: 1024, label: 'iPad (768×1024)' },
	'iphone-14': { width: 390, height: 844, label: 'iPhone 14 (390×844)' },
	'iphone-se': { width: 375, height: 667, label: 'iPhone SE (375×667)' },
	android: { width: 360, height: 640, label: 'Android (360×640)' },
};

function App() {
	const [urlA, setUrlA] = useState('https://example.com');
	const [urlB, setUrlB] = useState('https://example.org');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState(null);
	const [viewMode, setViewMode] = useState('slider');
	const [device, setDevice] = useState('laptop');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setResult(null);

		if (!urlA || !urlB) {
			setError('Please provide both URLs.');
			return;
		}

		setLoading(true);
		try {
			const viewport = DEVICE_PRESETS[device];
			const payload = { urlA, urlB, viewport };

			console.log('Sending request to:', 'http://localhost:5001/api/compare');
			console.log('Payload:', payload);

			const response = await fetch('http://localhost:5001/api/compare', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			console.log('Response status:', response.status);

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				console.error('Error response:', data);
				throw new Error(data.error || `Request failed with status ${response.status}`);
			}

			const data = await response.json();
			console.log('Success response:', data);
			setResult(data);
		} catch (err) {
			console.error('Fetch error:', err);
			setError(err.message || 'Something went wrong. Check browser console for details.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
			<div className="max-w-6xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">Playwright Screenshot Comparator</h1>
					<p className="text-muted-foreground">Compare visual differences between two websites</p>
				</div>

				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<CardTitle>Enter URLs to Compare</CardTitle>
						<CardDescription>Provide two website URLs to capture and compare their screenshots</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="urlA">URL A</Label>
								<Input
									id="urlA"
									type="url"
									value={urlA}
									onChange={(e) => setUrlA(e.target.value)}
									placeholder="https://site-one.com"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="urlB">URL B</Label>
								<Input
									id="urlB"
									type="url"
									value={urlB}
									onChange={(e) => setUrlB(e.target.value)}
									placeholder="https://site-two.com"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="device">Device / Viewport</Label>
								<Select id="device" value={device} onChange={(e) => setDevice(e.target.value)}>
									{Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
										<option key={key} value={key}>
											{preset.label}
										</option>
									))}
								</Select>
								<p className="text-xs text-muted-foreground">
									Select the screen size for screenshot comparison
								</p>
							</div>
							<Button type="submit" disabled={loading} className="w-full">
								{loading ? 'Comparing...' : 'Compare Screenshots'}
							</Button>
						</form>

						{error && (
							<div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
								<p className="text-sm text-destructive">{error}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{result && (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<CardTitle>Comparison Results</CardTitle>
									<CardDescription>
										<span className="inline-flex items-center gap-2">
											<span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
												{DEVICE_PRESETS[device].label}
											</span>
											• Similarity:{' '}
											<span className="font-semibold text-foreground">
												{result.similarityPercentage.toFixed(2)}%
											</span>
										</span>
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<div className="px-4 py-2 bg-destructive/10 border-2 border-destructive/30 rounded-lg">
										<div className="text-xs text-muted-foreground">Mismatched Pixels</div>
										<div className="text-2xl font-bold text-destructive">
											{result.mismatchPixels.toLocaleString()}
										</div>
									</div>
								</div>
							</div>
							<div className="mt-4">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger
										data-state={viewMode === 'slider' ? 'active' : 'inactive'}
										onClick={() => setViewMode('slider')}
									>
										Slide & Compare
									</TabsTrigger>
									<TabsTrigger
										data-state={viewMode === 'diff' ? 'active' : 'inactive'}
										onClick={() => setViewMode('diff')}
									>
										Diff View
									</TabsTrigger>
									<TabsTrigger
										data-state={viewMode === 'grid' ? 'active' : 'inactive'}
										onClick={() => setViewMode('grid')}
									>
										Grid View
									</TabsTrigger>
								</TabsList>
							</div>
						</CardHeader>
						<CardContent>
							{viewMode === 'slider' && (
								<div className="space-y-4">
									<div
										className="border rounded-lg overflow-auto bg-muted mx-auto"
										style={{ maxWidth: `${result.viewport.width}px` }}
									>
										<ReactCompareImage
											leftImage={`http://localhost:5001${result.screenshotAPath}`}
											rightImage={`http://localhost:5001${result.screenshotBPath}`}
											sliderLineWidth={3}
											sliderLineColor="#3b82f6"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4 text-sm text-center">
										<div className="p-2 bg-muted rounded-md">
											<div className="font-semibold">URL A</div>
											<div className="text-xs text-muted-foreground truncate">{result.urlA}</div>
										</div>
										<div className="p-2 bg-muted rounded-md">
											<div className="font-semibold">URL B</div>
											<div className="text-xs text-muted-foreground truncate">{result.urlB}</div>
										</div>
									</div>
								</div>
							)}

							{viewMode === 'diff' && (
								<div className="space-y-2">
									<div
										className="border rounded-lg overflow-auto bg-muted mx-auto"
										style={{ maxWidth: `${result.viewport.width}px` }}
									>
										<img
											src={`http://localhost:5001${result.diffImagePath}`}
											alt="Difference"
											className="max-w-full h-auto"
											style={{ imageRendering: 'crisp-edges' }}
										/>
									</div>
									<p className="text-sm text-muted-foreground text-center">
										Pink highlights show the differences between screenshots
									</p>
								</div>
							)}

							{viewMode === 'grid' && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-2">
										<h3 className="text-lg font-semibold">Screenshot A</h3>
										<div className="border rounded-lg overflow-auto bg-muted">
											<img
												src={`http://localhost:5001${result.screenshotAPath}`}
												alt="Screenshot A"
												className="max-w-full h-auto mx-auto"
												style={{ imageRendering: 'crisp-edges' }}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<h3 className="text-lg font-semibold">Screenshot B</h3>
										<div className="border rounded-lg overflow-auto bg-muted">
											<img
												src={`http://localhost:5001${result.screenshotBPath}`}
												alt="Screenshot B"
												className="max-w-full h-auto mx-auto"
												style={{ imageRendering: 'crisp-edges' }}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<h3 className="text-lg font-semibold">Difference</h3>
										<div className="border rounded-lg overflow-auto bg-muted">
											<img
												src={`http://localhost:5001${result.diffImagePath}`}
												alt="Diff"
												className="max-w-full h-auto mx-auto"
												style={{ imageRendering: 'crisp-edges' }}
											/>
										</div>
									</div>
								</div>
							)}

							<div className="mt-6 pt-4 border-t">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div className="text-center p-3 bg-muted rounded-lg">
										<div className="text-2xl font-bold">{result.similarityPercentage.toFixed(2)}%</div>
										<div className="text-xs text-muted-foreground">Similarity</div>
									</div>
									<div className="text-center p-3 bg-muted rounded-lg">
										<div className="text-2xl font-bold">{result.mismatchPercentage.toFixed(2)}%</div>
										<div className="text-xs text-muted-foreground">Mismatch</div>
									</div>
									<div className="text-center p-3 bg-muted rounded-lg">
										<div className="text-2xl font-bold">{result.totalPixels.toLocaleString()}</div>
										<div className="text-xs text-muted-foreground">Total Pixels</div>
									</div>
									<div className="text-center p-3 bg-muted rounded-lg">
										<div className="text-2xl font-bold">
											{result.viewport.width}×{result.viewport.height}
										</div>
										<div className="text-xs text-muted-foreground">Viewport</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

export default App;
