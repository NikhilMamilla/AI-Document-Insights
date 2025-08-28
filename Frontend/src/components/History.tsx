import { useEffect, useState } from 'react'
import { fetchInsights, deleteDocument } from '../services/api'

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

export default function History({ onDocumentSelect, refreshTrigger }: { onDocumentSelect: (doc: DocumentUI) => void, refreshTrigger: number }) {
	const [items, setItems] = useState<DocumentUI[]>([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(0)
	const limit = 10

	useEffect(() => {
		(async () => {
			const data = await fetchInsights(limit, page * limit)
			// Map API to UI structure
			setItems(data.documents.map((d) => ({ ...d, original_name: d.filename, processing_status: 'completed' })))
			setTotal(data.total)
		})()
	}, [page, refreshTrigger])

	const totalPages = Math.ceil(total / limit) || 1

	return (
		<div className="mt-0">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-lg font-semibold text-gray-800">Uploads</h3>
				<span className="text-xs text-gray-500">{total} total</span>
			</div>
			<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm p-2 sm:p-3">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-3 sm:px-4 py-3 text-left font-medium text-gray-600">Filename</th>
							<th className="px-3 sm:px-4 py-3 text-left font-medium text-gray-600">Uploaded</th>
							<th className="px-3 sm:px-4 py-3 text-left font-medium text-gray-600">Size</th>
							<th className="px-4 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{items.map((d) => (
							<tr key={d.id} className="odd:bg-white even:bg-gray-50">
								<td className="px-3 sm:px-4 py-3">
									<div className="flex items-center gap-2">
										<span className="inline-block h-2 w-2 rounded-full bg-green-500" />
										<span className="font-medium text-gray-800 truncate max-w-[160px] sm:max-w-none">{d.filename}</span>
									</div>
								</td>
								<td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(d.upload_date).toLocaleString()}</td>
								<td className="px-3 sm:px-4 py-3 text-gray-600">{(d.file_size / 1024).toFixed(1)} KB</td>
								<td className="px-3 sm:px-4 py-3 text-right space-x-1 sm:space-x-2">
									<button className="rounded border px-2 py-1 text-xs hover:bg-gray-50" onClick={() => onDocumentSelect(d)}>View</button>
									<button className="rounded border px-2 py-1 text-xs text-red-600 border-red-300 hover:bg-red-50" onClick={async () => { const ok = await deleteDocument(d.id); if (ok) { setItems((prev) => prev.filter((x) => x.id !== d.id)); setTotal((t) => Math.max(0, t - 1)) } }}>Delete</button>
								</td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<td colSpan={4} className="px-4 py-6 text-center text-gray-500">No documents yet</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="mt-3 flex items-center justify-end gap-2">
				<button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
				<span className="text-sm">Page {page + 1} / {totalPages}</span>
				<button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
			</div>
		</div>
	)
}


