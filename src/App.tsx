import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { LegalDashboard } from './pages/LegalDashboard';
function App() { return <ThemeProvider><AuthProvider><LegalDashboard /></AuthProvider></ThemeProvider>; }
export default App;
