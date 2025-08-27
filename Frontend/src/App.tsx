import React, { useState } from 'react'
import FileUpload from './components/FileUpload'
import InsightDisplay from './components/InsightDisplay'
import History from './components/History'
import LoadingSpinner from './components/LoadingSpinner'

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
interface UploadResult { success: boolean; document?: DocumentUI; error?: string }

const App: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')
	const [currentDocument, setCurrentDocument] = useState<DocumentUI | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [refreshHistory, setRefreshHistory] = useState(0)

	const handleUploadComplete = (result: UploadResult) => {
		if (result.success && result.document) {
			setCurrentDocument(result.document)
			setRefreshHistory((prev) => prev + 1)
		}
	}

	const handleDocumentSelect = (document: DocumentUI) => {
		setCurrentDocument(document)
		setActiveTab('upload')
	}

	return (
		<div className={`${currentDocument ? 'h-screen overflow-y-auto' : 'h-screen overflow-hidden'} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100`}>
			<header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div>
								<h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AI Document Insights</h1>
								<p className="text-sm text-gray-500">Powered by Sarvam AI</p>
							</div>
						</div>

						<nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
							<button onClick={() => setActiveTab('upload')} className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
								<div className="flex items-center space-x-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									<span>Upload</span>
								</div>
							</button>
							<button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
								<div className="flex items-center space-x-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>History</span>
								</div>
							</button>
						</nav>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				{activeTab === 'upload' ? (
					<div className="grid lg:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
								<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
									<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									Upload Document
								</h2>
								<FileUpload onUploadComplete={handleUploadComplete} setIsLoading={setIsLoading} />
								{isLoading && (
									<div className="mt-4 flex justify-center">
										<LoadingSpinner />
									</div>
								)}
							</div>
						</div>
						<div className="space-y-6">
							{currentDocument ? (
								<div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
									<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
										<svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										Document Insights
									</h2>
									<InsightDisplay document={currentDocument} />
								</div>
							) : (
								<div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
									<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
										<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
									</div>
									<h3 className="text-lg font-medium text-gray-500 mb-2">No Document Selected</h3>
									<p className="text-gray-400">Upload a PDF to see AI-powered insights</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
						<div className="p-6 border-b border-gray-200/50">
							<h2 className="text-xl font-semibold text-gray-900 flex items-center">
								<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Document History
							</h2>
							<p className="text-gray-500 mt-1">View and manage your uploaded documents</p>
						</div>
						<div className="p-6">
							<History onDocumentSelect={handleDocumentSelect} refreshTrigger={refreshHistory} />
						</div>
					</div>
				)}
			</main>

			<footer className="mt-16 py-8 border-t border-white/20">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<p className="text-gray-600 text-sm">
						Created by <span className="font-medium">Nikhil Mamilla</span> • 
						Mail: <a className="underline hover:text-blue-600" href="mailto:23211a05m7@bvrit.ac.in">23211a05m7@bvrit.ac.in</a> • 
						Phone: <a className="hover:text-blue-600" href="tel:+917842070463">7842070463</a>
					</p>
				</div>
			</footer>
		</div>
	)
}

export default App


