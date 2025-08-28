

interface WordCount { word: string; count: number }
interface DocumentUI {
	id: number
	filename: string
	original_name: string
	ai_summary?: string
	fallback_words?: WordCount[]
	upload_date: string
	file_size: number
	processing_status: string
}

export default function InsightDisplay({ document }: { document: DocumentUI }) {
	if (!document) return null

	const sections = parseSections(document.ai_summary)

	return (
		<div className="mt-1 rounded-2xl border border-gray-200 p-4">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">Insights</h3>
				<div className="flex items-center gap-2">
					<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{(document.file_size/1024).toFixed(1)} KB</span>
					<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">{document.filename}</span>
				</div>
			</div>

			{sections.length > 0 ? (
				<div className="space-y-4 sm:space-y-5">
					{sections.map((s) => (
						<section key={s.title} className="rounded-xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm">
							<h4 className="mb-2 text-sm font-semibold text-gray-800">{s.title}</h4>
							{s.bullets.length > 0 ? (
								<ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
									{s.bullets.map((b, i) => (<li key={i}>{b}</li>))}
								</ul>
							) : (
								<p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{s.body}</p>
							)}
						</section>
					))}
				</div>
			) : document.fallback_words && document.fallback_words.length ? (
				<div>
					<p className="mb-2 text-gray-700">Top keywords</p>
					<ul className="list-disc pl-6 text-sm">
						{document.fallback_words.map((w) => (
							<li key={w.word}>{w.word} — {w.count}</li>
						))}
					</ul>
				</div>
			) : (
				<p className="text-gray-500">No insights available.</p>
			)}
		</div>
	)
}

function parseSections(text?: string): Array<{ title: string; body: string; bullets: string[] }> {
	if (!text) return []
	const lines = text.split(/\r?\n/)
	const results: Array<{ title: string; body: string; bullets: string[] }> = []
	let currentTitle = 'Summary'
	let bodyLines: string[] = []
	let bullets: string[] = []

	const flush = () => {
		const body = bodyLines.join('\n').trim()
		results.push({ title: currentTitle.trim(), body, bullets: [...bullets] })
		bodyLines = []
		bullets = []
	}

	const isHeader = (l: string) =>
		/^\d+[).]\s+/.test(l) ||
		/^[A-Za-z].*:\s*$/.test(l) ||
		/^(Executive Summary|Key Topics|Section Highlights|Outline|Entities|Actionable Insights|Strengths|Gaps)\b/i.test(l)

	for (const raw of lines) {
		const l = raw.trim()
		if (!l) { bodyLines.push(''); continue }
		if (/^[-•]\s+/.test(l)) { bullets.push(l.replace(/^[-•]\s+/, '')); continue }
		if (isHeader(l)) { flush(); currentTitle = l.replace(/^\d+[).]\s*/, '') ; continue }
		bodyLines.push(l)
	}
	flush()
	return results.filter(s => s.body || s.bullets.length)
}


