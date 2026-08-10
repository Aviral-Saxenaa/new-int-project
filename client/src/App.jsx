import { useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import ChatWindow from './components/ChatWindow';

const App = () => {
  const { session } = useAuth();
  return session ? <ChatWindow /> : <LoginForm />;
};

export default App;
