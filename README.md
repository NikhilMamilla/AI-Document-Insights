# 🤖 AI Document Insights Tool

A powerful web application that uses AI to analyze and provide insights from PDF documents. Built with FastAPI, React, and Sarvam AI.

## ✨ Features

- **📄 PDF Processing**: Upload and extract text from PDF documents
- **🤖 AI-Powered Analysis**: Get intelligent insights using Sarvam AI
- **📊 Structured Reports**: Clean, formatted insights with bullet points
- **📚 Document History**: View and manage uploaded documents
- **🎨 Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **⚡ Real-time Processing**: Fast upload and analysis

## 🚀 Live Demo

**Frontend**: https://ai-document-insights-2kg0014i0-nikhilmamillas-projects.vercel.app

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **Sarvam AI** - AI analysis and insights
- **PyPDF2** - PDF text extraction
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📁 Project Structure

```
OneSol/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app
│   ├── ai_service.py       # AI integration
│   ├── pdf_processor.py    # PDF processing
│   ├── database.py         # Database operations
│   ├── models.py           # Pydantic models
│   └── requirements.txt    # Python dependencies
├── Frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json        # Node dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` files with your configuration:

**Backend (.env)**
```env
SARVAM_API_KEY=your_sarvam_api_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_FILE_SIZE=10485760
```

**Frontend (.env)**
```env
VITE_API_BASE=http://localhost:8000
```

## 🎯 Usage

1. **Upload Document**: Drag and drop or select a PDF file
2. **AI Analysis**: The system automatically processes and analyzes the document
3. **View Insights**: Get structured insights including:
   - Document Summary
   - Key Topics
   - Actionable Insights
   - Document Type Detection
4. **History**: View and manage previously uploaded documents

## 🔧 API Endpoints

- `POST /upload-resume` - Upload and process PDF
- `GET /insights` - Get document history
- `DELETE /documents/{id}` - Delete document

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd Frontend
vercel --prod
```

### Backend (Render/Railway)
1. Push to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

## 👨‍💻 Author

**Nikhil Mamilla**
- Email: 23211a05m7@bvrit.ac.in
- Phone: 7842070463

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🐛 Issues

If you find any bugs or have feature requests, please open an issue on GitHub.
