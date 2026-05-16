import LoginForm from '../../components/LoginForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 dark:from-[#0a0f1a] dark:via-[#0d1b33] dark:to-[#0a0f1a] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
