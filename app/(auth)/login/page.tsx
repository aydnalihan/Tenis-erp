'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate Supabase configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setError('Supabase yapılandırması eksik! Lütfen .env.local dosyasını kontrol edin.');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      if (!supabase) {
        setError('Supabase client oluşturulamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error('Login error:', authError);
        
        // Handle specific error messages
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('invalid_credentials')) {
          setError('Geçersiz e-posta veya şifre');
        } else if (authError.message.includes('Email not confirmed') ||
                   authError.message.includes('email_not_confirmed')) {
          setError('E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.');
        } else if (authError.message.includes('Too many requests')) {
          setError('Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.');
        } else {
          setError(authError.message || 'Giriş yapılırken bir hata oluştu');
        }
        setLoading(false);
        return;
      }

      if (data?.user && data?.session) {
        // Successfully logged in, redirect to dashboard
        // Use window.location for a full page reload to ensure session is set
        window.location.href = '/dashboard';
      } else {
        setError('Giriş başarısız. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      
      // Handle specific error types
      if (err?.message?.includes('Supabase yapılandırması eksik')) {
        setError('Supabase yapılandırması eksik! Lütfen .env.local dosyasını kontrol edin ve dev server\'ı yeniden başlatın.');
      } else if (err?.message?.includes('message port closed')) {
        setError('Bağlantı hatası. Lütfen sayfayı yenileyip tekrar deneyin.');
      } else {
        setError(err?.message || 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-3xl">🎾</span>
          </div>
          <CardTitle className="text-2xl font-bold">TenisERP</CardTitle>
          <CardDescription>
            Kulüp yönetim sistemine giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@teniskulubu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

