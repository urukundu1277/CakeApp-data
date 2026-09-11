import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
              OC
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              OrderCake
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Admin Management Panel
          </p>
        </div>
        <div className="card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
