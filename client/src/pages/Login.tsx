import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/lib/utils'
import { Truck, Route, ShieldCheck, PieChart, Info, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Enter valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})
type LoginForm = z.infer<typeof loginSchema>

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'], { required_error: 'Role is required' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type SignupForm = z.infer<typeof signupSchema>

export default function Login() {
  const [step, setStep] = useState<'login' | 'signup' | 'otp' | 'forgot-otp' | 'reset-password'>('login')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const { login, verifyOtp, register: registerUser, forgotPassword, verifyResetOtp, resetPassword, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'FLEET_MANAGER' }
  })

  const onSubmitLogin = async (data: LoginForm) => {
    setErrorMsg('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

  const onSubmitSignup = async (data: SignupForm) => {
    setErrorMsg('')
    try {
      const res = await registerUser(data.name, data.email, data.password, data.role)
      setVerifiedEmail(res.email)
      setStep('otp')
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

  const handleForgotPassword = async () => {
    const email = getValues('email')
    if (!email) {
      setErrorMsg('Please enter your email address to reset password')
      return
    }
    setErrorMsg('')
    try {
      const res = await forgotPassword(email)
      setVerifiedEmail(res.email)
      setStep('forgot-otp')
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

  const onSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (otpCode.length !== 6) {
      setErrorMsg('OTP must be 6 digits')
      return
    }
    try {
      await verifyOtp(verifiedEmail, otpCode)
      navigate('/dashboard')
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
      setOtpCode('')
    }
  }

  const onSubmitForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (otpCode.length !== 6) return setErrorMsg('OTP must be 6 digits')
    try {
      await verifyResetOtp(verifiedEmail, otpCode)
      setStep('reset-password')
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
      setOtpCode('')
    }
  }

  const onSubmitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (newPassword.length < 6) return setErrorMsg('Password must be at least 6 characters')
    if (newPassword !== confirmNewPassword) return setErrorMsg('Passwords do not match')
    try {
      await resetPassword(verifiedEmail, otpCode, newPassword)
      setStep('login')
      setOtpCode('')
      setNewPassword('')
      setConfirmNewPassword('')
      // Show success message as errorMsg briefly before user types (it uses same UI container for feedback)
      setErrorMsg('Password reset successfully. You can now sign in.')
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[35%] bg-slate-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Truck className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TransitOps</h1>
          </div>
          <p className="text-slate-400 text-lg mb-12">Smart Transport Operations Platform</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-300">
              <Route className="w-5 h-5 opacity-60" />
              <div>
                <p className="font-medium text-white">Fleet Manager</p>
                <p className="text-sm opacity-80">Oversees fleet, maintenance, vehicle lifecycle</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <Route className="w-5 h-5 opacity-60" />
              <div>
                <p className="font-medium text-white">Dispatcher</p>
                <p className="text-sm opacity-80">Creates trips, assigns vehicles and drivers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <ShieldCheck className="w-5 h-5 opacity-60" />
              <div>
                <p className="font-medium text-white">Safety Officer</p>
                <p className="text-sm opacity-80">Tracks license validity, monitors safety scores</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <PieChart className="w-5 h-5 opacity-60" />
              <div>
                <p className="font-medium text-white">Financial Analyst</p>
                <p className="text-sm opacity-80">Reviews expenses, fuel, maintenance costs</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-slate-500 text-xs">
          v2.4.0 © 2024 TransitOps
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10 transition-all duration-300">
          
          {step === 'login' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Sign in to your account</h2>
              <p className="text-slate-500 mb-8">Enter your details to access the dashboard</p>
              
              <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">Email address</label>
                  <input 
                    type="email" 
                    {...register('email')} 
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                    placeholder="name@transitops.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-medium text-slate-700">Password</label>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); handleForgotPassword() }} 
                      className="text-amber-600 text-[13px] font-medium hover:text-amber-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input 
                    type="password" 
                    {...register('password')} 
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {errorMsg && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{errorMsg}</div>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-[15px] transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setStep('signup')} className="text-slate-500 text-[13px] hover:text-slate-800 transition-colors">
                    Don't have an account? Create one
                  </button>
                </div>
              </form>
            </div>
          ) : step === 'signup' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Create an account</h2>
              <p className="text-slate-500 mb-6">Enter your details to register</p>
              
              <form onSubmit={handleSignupSubmit(onSubmitSignup)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    {...registerSignup('name')} 
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                    placeholder="John Doe"
                  />
                  {signupErrors.name && <p className="text-red-500 text-xs mt-1">{signupErrors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">Email address</label>
                  <input 
                    type="email" 
                    {...registerSignup('email')} 
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                    placeholder="name@transitops.com"
                  />
                  {signupErrors.email && <p className="text-red-500 text-xs mt-1">{signupErrors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">Role</label>
                  <select 
                    {...registerSignup('role')} 
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                  {signupErrors.role && <p className="text-red-500 text-xs mt-1">{signupErrors.role.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-slate-700">Password</label>
                    <input 
                      type="password" 
                      {...registerSignup('password')} 
                      className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                    {signupErrors.password && <p className="text-red-500 text-xs mt-1">{signupErrors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-slate-700">Confirm Password</label>
                    <input 
                      type="password" 
                      {...registerSignup('confirmPassword')} 
                      className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                    {signupErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{signupErrors.confirmPassword.message}</p>}
                  </div>
                </div>

                {errorMsg && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{errorMsg}</div>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign Up
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setStep('login')} className="text-slate-500 text-[13px] hover:text-slate-800 transition-colors">
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            </div>
          ) : step === 'otp' ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Verify your identity</h2>
              <p className="text-slate-500 mb-6">OTP sent to <span className="font-medium text-slate-800">{verifiedEmail}</span></p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 mb-8">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[13px] text-amber-800 font-medium">Check your server console for the OTP code.</p>
              </div>

              <form onSubmit={onSubmitOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">6-Digit Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    pattern="[0-9]*"
                    autoFocus
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-[1em] text-2xl h-14 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                {errorMsg && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{errorMsg}</div>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-[15px] transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify OTP
                </button>
                
                <div className="text-center">
                  <button type="button" onClick={() => setStep('login')} className="text-slate-500 text-sm hover:text-slate-800 transition-colors">
                    Back to login
                  </button>
                </div>
              </form>
            </div>
          ) : step === 'forgot-otp' ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Verify Reset Request</h2>
              <p className="text-slate-500 mb-6">OTP sent to <span className="font-medium text-slate-800">{verifiedEmail}</span></p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 mb-8">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[13px] text-amber-800 font-medium">Check your server console for the password reset OTP.</p>
              </div>

              <form onSubmit={onSubmitForgotOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">6-Digit Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    pattern="[0-9]*"
                    autoFocus
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-[1em] text-2xl h-14 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                {errorMsg && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{errorMsg}</div>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-[15px] transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify OTP
                </button>
                
                <div className="text-center">
                  <button type="button" onClick={() => setStep('login')} className="text-slate-500 text-sm hover:text-slate-800 transition-colors">
                    Back to login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Set New Password</h2>
              <p className="text-slate-500 mb-6">Create a new password for <span className="font-medium text-slate-800">{verifiedEmail}</span></p>

              <form onSubmit={onSubmitResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">New Password</label>
                  <input 
                    type="password" 
                    autoFocus
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>

                {errorMsg && <div className={`text-sm p-3 rounded-lg ${errorMsg.includes('successful') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{errorMsg}</div>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Set Password
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
