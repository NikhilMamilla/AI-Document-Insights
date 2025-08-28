import React, { useCallback, useRef, useState } from 'react'
import { uploadDocument, type UploadResult } from '../services/api'

interface FileUploadProps {
	onUploadComplete: (result: UploadResult) => void
	setIsLoading: (loading: boolean) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, setIsLoading }) => {
	const [isDragOver, setIsDragOver] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [error, setError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const validateFile = (file: File): string | null => {
		if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
			return 'Please select a PDF file only'
		}
		if (file.size > 10 * 1024 * 1024) {
			return 'File size must be less than 10MB'
		}
		return null
	}

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	const handleFileSelect = useCallback((file: File) => {
		const validationError = validateFile(file)
		if (validationError) {
			setError(validationError)
			return
		}
		setError(null)
		setSelectedFile(file)
	}, [])

	const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true) }, [])
	const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false) }, [])
	const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }, [])
	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault(); e.stopPropagation(); setIsDragOver(false)
		const files = Array.from(e.dataTransfer.files)
		if (files.length > 0) handleFileSelect(files[0])
	}, [handleFileSelect])

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files && files.length > 0) handleFileSelect(files[0])
	}, [handleFileSelect])

	const handleUpload = async () => {
		if (!selectedFile) return
		setIsLoading(true)
		setUploadProgress(0)
		setError(null)
		try {
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) { clearInterval(progressInterval); return 90 }
					return prev + 10
				})
			}, 200)
			const result = await uploadDocument(selectedFile)
			clearInterval(progressInterval)
			setUploadProgress(100)
			setTimeout(() => {
				setIsLoading(false)
				setUploadProgress(0)
				setSelectedFile(null)
				onUploadComplete(result)
				if (fileInputRef.current) fileInputRef.current.value = ''
			}, 500)
		} catch (err: unknown) {
			setIsLoading(false)
			setUploadProgress(0)
			const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.'
			setError(errorMessage)
		}
	}

	const clearSelection = () => {
		setSelectedFile(null)
		setError(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	return (
		<div className="space-y-4">
			<div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-blue-400 bg-blue-50/50 scale-[1.02]' : selectedFile ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}>
				<input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleInputChange} className="hidden" />
				{selectedFile ? (
					<div className="space-y-4">
						<div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						</div>
						<div>
							<h3 className="font-medium text-green-700 mb-1">File Selected</h3>
							<p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded inline-block">{selectedFile.name}</p>
							<p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)} • PDF Document</p>
						</div>
						<button onClick={(e) => { e.stopPropagation(); clearSelection() }} className="text-sm text-gray-500 hover:text-red-500 transition-colors">✕ Clear selection</button>
					</div>
				) : (
					<div className="space-y-4">
						<div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${isDragOver ? 'bg-gradient-to-r from-blue-500 to-cyan-500 scale-110' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
						</div>
						<div>
							<h3 className="font-medium text-gray-700 mb-2">{isDragOver ? 'Drop your PDF here' : 'Choose PDF or drag & drop'}</h3>
							<p className="text-sm text-gray-500">Support for documents up to 10MB</p>
							<p className="text-xs text-gray-400 mt-1">PDF files only • Resume analysis optimized</p>
						</div>
					</div>
				)}
				{isDragOver && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse pointer-events-none" />}
			</div>

			{uploadProgress > 0 && uploadProgress < 100 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm"><span className="text-gray-600">Uploading & Processing...</span><span className="text-blue-600 font-medium">{uploadProgress}%</span></div>
					<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"><div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} /></div>
					<p className="text-xs text-gray-500 text-center">Extracting text and generating AI insights...</p>
				</div>
			)}

			{uploadProgress === 100 && (
				<div className="text-center py-2">
					<div className="inline-flex items-center space-x-2 text-green-600">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span className="font-medium">Upload completed successfully!</span>
					</div>
				</div>
			)}

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3">
					<div className="flex items-start space-x-2">
						<svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
						<div>
							<p className="text-sm font-medium text-red-700">Upload Error</p>
							<p className="text-sm text-red-600">{error}</p>
						</div>
					</div>
				</div>
			)}

			{selectedFile && !uploadProgress && (
				<button onClick={handleUpload} disabled={!!error} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-5 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
					<div className="flex items-center justify-center space-x-2">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
						<span>Analyze with AI</span>
					</div>
				</button>
			)}

			<div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
				<h4 className="text-sm font-medium text-blue-900 mb-1">💡 Tips for better results:</h4>
				<ul className="text-xs text-blue-700 space-y-1">
					<li>• Upload clear, readable PDF documents</li>
					<li>• Resume and CV files work best</li>
					<li>• Text-based PDFs give more accurate insights</li>
				</ul>
			</div>
		</div>
	)
}

export default FileUpload


