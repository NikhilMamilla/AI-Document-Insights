import axios from 'axios'
import type { InsightsResponse, UploadResponse } from '../types'

export interface WordCount { word: string; count: number }
export interface DocumentItemUI {
	id: number
	filename: string
	original_name: string
	ai_summary?: string
	fallback_words?: WordCount[]
	upload_date: string
	file_size: number
	processing_status: string
}
export interface UploadResult {
	success: boolean
	document?: DocumentItemUI
	error?: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function uploadResume(file: File) : Promise<UploadResponse> {
	const form = new FormData()
	form.append('file', file)
	const { data } = await axios.post(`${API_BASE}/upload-resume`, form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	return data
}

export async function fetchInsights(limit = 10, offset = 0): Promise<InsightsResponse> {
	const { data } = await axios.get(`${API_BASE}/insights`, { params: { limit, offset } })
	return data
}

// New helper shaping to UI Document
export async function uploadDocument(file: File): Promise<UploadResult> {
	try {
		const raw = await uploadResume(file)
		const doc: DocumentItemUI = {
			id: raw.id,
			filename: raw.filename,
			original_name: raw.filename,
			ai_summary: raw.ai_summary,
			fallback_words: raw.fallback_words,
			upload_date: new Date().toISOString(),
			file_size: file.size,
			processing_status: 'completed',
		}
		return { success: true, document: doc }
	} catch (e: any) {
		return { success: false, error: e?.response?.data?.detail || 'Upload failed' }
	}
}

export async function deleteDocument(id: number): Promise<boolean> {
	try {
		await axios.delete(`${API_BASE}/documents/${id}`)
		return true
	} catch {
		return false
	}
}


