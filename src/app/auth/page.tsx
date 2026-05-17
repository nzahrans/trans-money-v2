import LoginForm from '../../components/LoginForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-50 dark:from-[#071426] dark:via-[#0D2D4E] dark:to-[#071426] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
