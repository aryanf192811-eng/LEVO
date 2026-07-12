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

export default function Login() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const { login, verifyOtp, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmitLogin = async (data: LoginForm) => {
    setErrorMsg('')
    try {
      const res = await login(data.email, data.password)
      setVerifiedEmail(res.email)
      setStep('otp')
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
          
          {step === 'credentials' ? (
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
                    <a href="#" className="text-amber-600 text-[13px] font-medium hover:text-amber-700">Forgot password?</a>
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
              </form>
            </div>
          ) : (
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
                  <button type="button" onClick={() => setStep('credentials')} className="text-slate-500 text-sm hover:text-slate-800 transition-colors">
                    Back to login
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
