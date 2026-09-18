/* export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-slate-900">Sign Up</h1>
        <p className="mt-2 text-slate-600">Create your account.</p>
      </div>
    </main>
  );
} */

import AuthForm from "@/components/AuthForm";

const SignUp = async () => {
  return (
    <section className='flex-center size-full max-sm:px-6'>
      <AuthForm type='sign-up' />
    </section>
  )
}

export default SignUp