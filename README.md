# 🌱 AgroScan AI

> AI-Powered Plant Disease Detection Platform with Real-Time Analysis, Voice Assistance, Multilingual Support, and Smart Farming Insights.

![AgroScan AI Banner](https://img.shields.io/badge/AI-Plant%20Disease%20Detection-green)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![PostgreSQL](https://img.shields.io/badge/Database-Postgres-blue)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38BDF8)
![Gemini](https://img.shields.io/badge/AI-Gemini%20Vision-orange)

---

## 📖 Overview

AgroScan AI is a full-stack intelligent agriculture platform that helps farmers and agricultural professionals identify plant diseases from leaf images using Artificial Intelligence.

Users can upload a leaf image or capture it using their device camera, and AgroScan AI instantly analyzes the plant, detects diseases, provides confidence scores, treatment recommendations, preventive measures, and voice-based explanations.

The platform is designed with accessibility, multilingual support, and mobile-first responsiveness to make advanced AI accessible to farmers everywhere.

---

## ✨ Key Features

### 🤖 AI Disease Detection

* Upload plant leaf images
* Real-time disease analysis
* Confidence score visualization
* Healthy vs Diseased classification
* Detailed diagnosis reports

### 📷 Smart Scanning

* Camera capture support
* Gallery upload support
* Live preview before analysis
* Mobile optimized scanning interface

### 🔊 Voice Assistance

* Text-to-Speech disease explanation
* Speech recognition commands
* Hands-free interaction
* Multi-language voice output

### 🌐 Multilingual Support

* English
* हिन्दी (Hindi)
* తెలుగు (Telugu)

### 👤 Authentication System

* Email & Password Login
* User Registration
* Anonymous Guest Access
* Secure Session Management

### 📊 Scan History

* Previous diagnosis records
* Searchable scan history
* User-specific storage
* Timestamp tracking

### 📚 Disease Library

* Plant disease knowledge base
* Symptoms
* Causes
* Prevention methods
* Treatment recommendations

### 📱 Responsive Design

* Mobile-first UI
* Tablet optimized
* Desktop support
* Progressive Web App ready

---

## 🏗️ System Architecture

```text
                    ┌─────────────────┐
                    │     User        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ React + Vite UI │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼

 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │ Cloud Auth   │   │ Edge Function│   │ PostgreSQL   │
 │ Authentication│  │ AI Analysis  │   │ Database     │
 └──────────────┘   └──────┬───────┘   └──────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Gemini Vision AI │
                  └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* Framer Motion
* React Router
* Web Speech API

### Backend

* Lovable Cloud
* Edge Functions
* PostgreSQL
* Row Level Security (RLS)

### AI & ML

* Gemini Vision AI
* Image Analysis
* Structured Tool Calling

### Authentication

* Cloud Auth
* Anonymous Guest Login

### Storage

* Cloud Storage
* PostgreSQL Database

---

## 📂 Project Structure

```bash
AgroScan-AI/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── contexts/
│   ├── utils/
│   ├── assets/
│   └── translations/
│
├── cloud/
│   ├── functions/
│   ├── auth/
│   └── storage/
│
├── database/
│   └── schema.sql
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Application Flow

### User Journey

1. Launch AgroScan AI
2. Login / Register / Continue as Guest
3. Upload leaf image or open camera
4. AI analyzes plant health
5. Receive diagnosis report
6. Listen to voice explanation
7. Save result to history
8. Browse disease library
9. Switch preferred language

---

## 🧠 AI Prediction Workflow

```text
Leaf Image
     │
     ▼
Image Upload
     │
     ▼
AI Vision Analysis
     │
     ▼
Disease Detection
     │
     ▼
Confidence Calculation
     │
     ▼
Diagnosis Report
     │
     ▼
Treatment + Prevention
```

---

## 🎨 Design System

### Color Palette

| Color        | Hex                    |
| ------------ | ---------------------- |
| Forest Green | #1B5E20                |
| Leaf Green   | #66BB6A                |
| Light Green  | #A5D6A7                |
| Background   | #F5FFF5                |
| White Glass  | rgba(255,255,255,0.15) |

### Typography

* Poppins
* Inter

### UI Principles

* Glassmorphism
* Smooth animations
* Clean spacing
* Accessibility first
* Mobile-first design

---

## 🔒 Security Features

* Row Level Security (RLS)
* Protected API routes
* Secure authentication
* User-specific history access
* Encrypted session management

---

## 📈 Future Enhancements

* Plant species identification
* Offline AI support
* Pest detection
* Crop recommendation engine
* Weather integration
* Fertilizer suggestions
* Farmer community forum
* AI chatbot assistant

---

## 🧪 Example AI Response

```json
{
  "plant": "Tomato",
  "disease": "Early Blight",
  "confidence": "94%",
  "description": "A fungal disease affecting tomato leaves.",
  "remedies": [
    "Apply fungicide",
    "Remove infected leaves",
    "Improve air circulation"
  ],
  "prevention": [
    "Avoid overhead watering",
    "Use disease-resistant varieties"
  ]
}
```

---

## 💡 Impact

AgroScan AI empowers farmers by:

* Detecting diseases early
* Reducing crop losses
* Improving productivity
* Supporting sustainable farming
* Making AI accessible in regional languages


ject useful, please consider giving it a star on GitHub!
