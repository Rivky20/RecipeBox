import { useState } from 'react';
import {
  Box, Button, Field, Heading, Input, InputGroup, Stack, Text,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';

export default function LoginModal() {
  const { isOpen, mode, sessionExpired, setMode, close } = useAuthModal();
  const { login, register } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);

  if (!isOpen) return null;

  const resetAll = () => {
    setLoginEmail(''); setLoginPassword(''); setLoginError('');
    setRegUsername(''); setRegEmail(''); setRegPassword(''); setRegConfirm(''); setRegErrors({});
  };

  const switchMode = (m: 'login' | 'register') => { resetAll(); setMode(m); };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      resetAll();
      close();
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'פרטי ההתחברות שגויים.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const validateReg = () => {
    const e: Record<string, string> = {};
    if (!regUsername.trim()) e.username = 'שם משתמש נדרש.';
    if (!regEmail.trim()) e.email = 'אימייל נדרש.';
    if (regPassword.length < 6) e.password = 'הסיסמה חייבת להכיל לפחות 6 תווים.';
    if (regPassword !== regConfirm) e.confirm = 'הסיסמאות אינן תואמות.';
    return e;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateReg();
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return; }
    setRegErrors({});
    setRegLoading(true);
    try {
      await register(regEmail, regPassword, regUsername);
      resetAll();
      close();
    } catch (err: any) {
      setRegErrors({ general: err?.response?.data?.message || 'ההרשמה נכשלה. נסה שוב.' });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset={0}
        bg="whiteAlpha.800"
        backdropFilter="blur(4px)"
        zIndex={1000}
        onClick={close}
      />

      {/* Modal box */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1001}
        bg="white"
        borderRadius="2xl"
        shadow="2xl"
        w="full"
        maxW="420px"
        p={8}
        dir="rtl"
      >
        {/* Tab toggle */}
        <Box
          display="flex"
          bg="gray.100"
          borderRadius="lg"
          p={1}
          mb={6}
          gap={1}
        >
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: mode === m ? 'white' : 'transparent',
                fontWeight: mode === m ? 700 : 400,
                color: mode === m ? '#319795' : '#718096',
                cursor: 'pointer',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
                fontSize: '14px',
              }}
            >
              {m === 'login' ? 'התחברות' : 'הרשמה'}
            </button>
          ))}
        </Box>

        {/* ── Login Form ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <Stack gap={4}>
              {sessionExpired && (
                <Box
                  bg="#FFF3CD"
                  border="1px solid #F5C842"
                  borderRadius="lg"
                  px={4}
                  py={3}
                  textAlign="center"
                  fontSize="sm"
                  fontWeight="600"
                  color="#7D5A00"
                  dir="rtl"
                >
                  פג תוקף החיבור שלך — אנא התחבר מחדש
                </Box>
              )}
              <Heading size="lg" textAlign="center" color="teal.700">ברוך השב!</Heading>

              <Field.Root>
                <Field.Label>אימייל</Field.Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </Field.Root>

              <Field.Root invalid={!!loginError}>
                <Field.Label>סיסמה</Field.Label>
                <InputGroup
                  endElement={
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      color="gray.400"
                      px={2}
                      cursor="pointer"
                      background="none"
                      border="none"
                    >
                      {showLoginPw ? <FaEyeSlash /> : <FaEye />}
                    </Box>
                  }
                >
                  <Input
                    type={showLoginPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </InputGroup>
                {loginError && <Field.ErrorText>{loginError}</Field.ErrorText>}
              </Field.Root>

              <Button type="submit" colorPalette="teal" width="full" loading={loginLoading} loadingText="מתחבר...">
                התחבר
              </Button>

              <Text textAlign="center" fontSize="sm" color="gray.500">
                אין לך חשבון?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{ color: '#319795', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  הירשם כאן
                </button>
              </Text>
            </Stack>
          </form>
        )}

        {/* ── Register Form ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <Stack gap={4}>
              <Heading size="lg" textAlign="center" color="teal.700">צור חשבון</Heading>

              <Field.Root invalid={!!regErrors.username}>
                <Field.Label>שם משתמש</Field.Label>
                <Input
                  placeholder="השם שיוצג בפרופיל"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
                {regErrors.username && <Field.ErrorText>{regErrors.username}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!regErrors.email}>
                <Field.Label>אימייל</Field.Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                {regErrors.email && <Field.ErrorText>{regErrors.email}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!regErrors.password}>
                <Field.Label>סיסמה</Field.Label>
                <InputGroup
                  endElement={
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setShowRegPw((v) => !v)}
                      color="gray.400"
                      px={2}
                      cursor="pointer"
                      background="none"
                      border="none"
                    >
                      {showRegPw ? <FaEyeSlash /> : <FaEye />}
                    </Box>
                  }
                >
                  <Input
                    type={showRegPw ? 'text' : 'password'}
                    placeholder="לפחות 6 תווים"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </InputGroup>
                {regErrors.password && <Field.ErrorText>{regErrors.password}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!regErrors.confirm}>
                <Field.Label>אימות סיסמה</Field.Label>
                <InputGroup
                  endElement={
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setShowRegConfirm((v) => !v)}
                      color="gray.400"
                      px={2}
                      cursor="pointer"
                      background="none"
                      border="none"
                    >
                      {showRegConfirm ? <FaEyeSlash /> : <FaEye />}
                    </Box>
                  }
                >
                  <Input
                    type={showRegConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    required
                  />
                </InputGroup>
                {regErrors.confirm && <Field.ErrorText>{regErrors.confirm}</Field.ErrorText>}
              </Field.Root>

              {regErrors.general && (
                <Text color="red.500" fontSize="sm" textAlign="center">{regErrors.general}</Text>
              )}

              <Button type="submit" colorPalette="teal" width="full" loading={regLoading} loadingText="נרשם...">
                הירשם
              </Button>

              <Text textAlign="center" fontSize="sm" color="gray.500">
                כבר יש לך חשבון?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{ color: '#319795', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  התחבר כאן
                </button>
              </Text>
            </Stack>
          </form>
        )}
      </Box>
    </>
  );
}
