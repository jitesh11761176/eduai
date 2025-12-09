<div align="center">


# 🎓 EduAI Platform

**The fastest path from prompt to production with Gemini AI**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-4285F4.svg)](https://ai.google.dev/)


*An AI-powered educational platform that revolutionizes learning with intelligent tutoring, adaptive pathways, and seamless course management.*

</div>

## ✨ Features

### 🚀 For Students
- **AI-Adaptive Pathways** - Personalized learning routes that adapt in real-time
- **24/7 AI Voice Tutor** - Get instant help with voice-powered AI assistance
- **Interactive Courses** - Engaging content with multimedia materials
- **Real-time Discussions** - Collaborate with peers and instructors
- **Project Workspaces** - Manage assignments and group projects
- **Career Center** - Industry-recognized micro-credentials and career guidance
- **Competitive Exam Prep** - Comprehensive preparation for SSC, UPSC, NDA, and more
- **Google Drive Backup** - Automatic cloud sync of test history and progress across devices

### 👨‍🏫 For Teachers
- **AI Lesson Planner** - Generate complete lesson plans in seconds
- **Predictive Analytics** - Identify at-risk students before they struggle
- **Automated Feedback** - Provide rich, constructive feedback instantly
- **Course Management** - Streamlined content creation and organization
- **Student Analytics** - Track progress and engagement metrics

### 🏫 For Administrators
- **User Management** - Comprehensive admin dashboard
- **Course Analytics** - Institution-wide insights and reporting
- **Resource Management** - Efficient allocation of educational resources

## 🚀 Quick Start

### Prerequisites
- **Node.js** (16.0 or higher)
- **npm** or **yarn**
- **Google AI API Key** ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitesh11761176/eduai.git
   cd eduai
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your credentials:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   
   # Google Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key
   
   # Google Drive API (Optional - for user data backup)
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your_api_key
   ```
   
   📖 **For Google Drive setup**, see [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application.

## 🌐 Deploy to Vercel

Deploy your EduAI platform to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jitesh11761176/eduai)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   
   In your Vercel dashboard, add your environment variables:
   - `GEMINI_API_KEY`: Your Google AI API key

### Environment Variables for Vercel

Make sure to set these environment variables in your Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google AI Gemini API key | ✅ |

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run proxy` - Start development proxy server

## 🏗️ Project Structure

```
eduai/
├── components/           # React components
│   ├── dashboard/       # Dashboard components
│   ├── course/          # Course-related components
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout components
├── data/                # Mock data and types
├── services/            # API services and Firebase
├── types/               # TypeScript type definitions
├── contexts/            # React contexts
└── server/              # Server and proxy configuration
```

## 🎯 Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI
- **Backend**: Firebase
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📱 Google AI Studio Integration

This platform is built with Google AI Studio and leverages the power of Gemini AI for:
- Intelligent content generation
- Personalized learning recommendations
- Automated grading and feedback
- Voice-powered tutoring

View the app in AI Studio: [https://ai.studio/apps/drive/1q-igWHA-0OlMrtfKyPXP0552WQZfrMME](https://ai.studio/apps/drive/1q-igWHA-0OlMrtfKyPXP0552WQZfrMME)

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

This project is brought to you by:

- **[@jitesh11761176](https://github.com/jitesh11761176)** - Project Lead & Backend Development
- **[@aryan6673](https://github.com/aryan6673)** - Frontend Development & UI/UX Design

## 🙏 Acknowledgments

- Google AI Studio team for the amazing Gemini AI integration
- The open-source community for the incredible tools and libraries
- All contributors who help make this project better

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/jitesh11761176/eduai/issues) page
2. Create a new issue if your problem isn't already listed
3. Join our community discussions

---

<div align="center">

**Built with ❤️ by [@jitesh11761176](https://github.com/jitesh11761176) and [@aryan6673](https://github.com/aryan6673)**

*Empowering education through AI innovation*

</div>
