import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { jwtDecode } from "jwt-decode";
import { getDeviceToken } from "../utils/deviceToken";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // 2FA state management
  const [otp, setOtp] = useState("");
  const [otpPhase, setOtpPhase] = useState<'idle' | 'sent'>('idle');
  const [otpMethod, setOtpMethod] = useState<'email' | 'totp' | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const deviceToken = await getDeviceToken();
      
      if (otpPhase === 'idle') {
        // Try normal login (server will send OTP if 2FA enabled)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, deviceToken }),
        });

        const data = await response.json();

        if (response.ok && data.status === true) {
          if (data.otpRequired) {
            toast.success('OTP sent to your email');
            setOtpPhase('sent');
            setOtpMethod(data.method || 'email');
            setShowOtpModal(true);
          } else if (data.token) {
            try {
              // Use jwt-decode library to decode the token
              const decoded = jwtDecode<{role: string}>(data.token);
              
              // Check if user has admin role
              if (decoded.role === "admin") {
                // Store the token and isAdmin flag in localStorage
                localStorage.setItem("adminToken", data.token);
                localStorage.setItem("isAdmin", "true");
                toast.success('Admin login successful!');
                navigate("/al-dashboard-1289");
              } else {
                setError("Access denied. Admin privileges required.");
              }
            } catch (e) {
              setError("Failed to verify user credentials.");
            }
          } else {
            setError(data.message || "Login failed. Please check your credentials.");
          }
        } else {
          setError(data.message || "Login failed. Please check your credentials.");
        }
      } else if (otpPhase === 'sent') {
        // Step 2: verify OTP (email or totp)
        const code = otpDigits.join('') || otp;
        let response;
        
        if (otpMethod === 'totp') {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login/totp-verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, token: code, deviceToken }),
          });
        } else {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login/verify-otp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp: code, deviceToken }),
          });
        }
        
        const data = await response.json();
        
        if (response.ok && data.status === true && data.token) {
          try {
            // Use jwt-decode library to decode the token
            const decoded = jwtDecode<{role: string}>(data.token);
            
            // Check if user has admin role
            if (decoded.role === "admin") {
              // Store the token and isAdmin flag in localStorage
              localStorage.setItem("adminToken", data.token);
              localStorage.setItem("isAdmin", "true");
              toast.success('Admin login successful!');
              setOtp(''); 
              setOtpPhase('idle'); 
              setOtpMethod(null); 
              setShowOtpModal(false); 
              setOtpDigits(['','','','','','']);
              navigate("/al-dashboard-1289");
            } else {
              setError("Access denied. Admin privileges required.");
            }
          } catch (e) {
            setError("Failed to verify user credentials.");
          }
        } else {
          setError(data.message || "OTP verification failed.");
        }
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={otpPhase !== 'idle'}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : (otpPhase === 'sent' ? 'Verify OTP' : 'Sign In')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* OTP Verification Modal */}
      {otpPhase === 'sent' && showOtpModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.45)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999 
        }}>
          <div style={{ 
            width: 520, 
            maxWidth: '92vw', 
            background: '#fff', 
            padding: '24px 18px', 
            borderRadius: 16, 
            boxShadow: '0 14px 34px rgba(0,0,0,.25)' 
          }}>
            <h3 style={{ 
              margin: 0, 
              textAlign: 'center', 
              fontWeight: 800, 
              color: '#111', 
              fontSize: 22 
            }}>
              Verify Your OTP
            </h3>
            <p style={{ 
              margin: '8px 0 16px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              {otpMethod === 'totp' 
                ? 'Enter the 6-digit code from your Authenticator app.' 
                : 'Enter the 6-digit OTP sent to your email.'
              }
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 10, 
              marginBottom: 16 
            }}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                    const next = [...otpDigits];
                    next[i] = val;
                    setOtpDigits(next);
                    if (val && i < 5) otpRefs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder=""
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    border: '1.5px solid #d6d6d6',
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmit as any}
              disabled={loading}
              style={{ 
                width: '100%', 
                background: 'rgb(249 115 22)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 10, 
                padding: '12px 16px', 
                fontWeight: 800, 
                cursor: 'pointer' 
              }}
            >
              {loading ? 'VERIFYING...' : 'Verify OTP'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <button
                type="button"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#999', 
                  cursor: 'pointer', 
                  fontWeight: 600 
                }}
                onClick={() => { 
                  setShowOtpModal(false); 
                  setOtpPhase('idle'); 
                  setOtpDigits(['','','','','','']); 
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
