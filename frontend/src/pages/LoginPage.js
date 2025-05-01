import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(21, 97, 111, 0.13);
  padding: 3.5rem 2.5rem 2.5rem 2.5rem;
  width: 100%;
  max-width: 410px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: ${fadeIn} 0.7s cubic-bezier(.22,1,.36,1);
  position: relative;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 800;
  letter-spacing: -1px;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 1.09rem;
  outline: none;
  margin-bottom: 0.8rem;
  transition: border 0.2s;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.2rem;
  box-shadow: 0 2px 8px rgba(21, 97, 111, 0.08);
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  &:hover {
    background: #104e5e;
    box-shadow: 0 4px 16px rgba(21, 97, 111, 0.13);
    transform: translateY(-2px) scale(1.03);
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 1rem;
  margin: 0.25rem 0;
  text-decoration: underline;
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 1.05rem;
  text-align: center;
  margin-top: -0.7rem;
`;

const TabSwitcher = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : '#f2f2f2')};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.primary)};
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.6rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(21, 97, 111, 0.09)' : 'none')};
`;

function LoginPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser, loading } = useAuth();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (tab === 'login') {
        const result = await loginUser({ email: form.email, password: form.password });
        console.log('Resultado do login:', result);
        
        if (result.success) {
          console.log('Login bem-sucedido, redirecionando para dashboard...');
          setTimeout(() => {
            navigate('/');
          }, 100);
        } else {
          setError(result.message || 'Erro ao fazer login.');
        }
      } else if (tab === 'register') {
        console.log('[DEBUG] Attempting registration with data:', form);
        const registrationData = { 
          name: form.name, 
          email: form.email, 
          password: form.password 
        };
        const data = await register(registrationData); 
        console.log('[DEBUG] Register API response:', data);
        if (data && data._id) { 
           alert('Cadastro realizado com sucesso! Por favor, faça login.');
           setTab('login');
           setForm({ email: form.email, password: '', name: '' });
        } else {
           setError(data.message || 'Erro inesperado ao cadastrar. Resposta inválida.');
        }
      } else if (tab === 'forgot') {
        setError('Funcionalidade em breve.');
      }
    } catch (err) {
      console.error('Erro no envio do formulário:', err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <Container>
      <Card>
        <Title>Allia</Title>
        <TabSwitcher>
          <Tab $active={tab === 'login'} onClick={() => setTab('login')}>Entrar</Tab>
          <Tab $active={tab === 'register'} onClick={() => setTab('register')}>Cadastrar</Tab>
          <Tab $active={tab === 'forgot'} onClick={() => setTab('forgot')}>Recuperar Senha</Tab>
        </TabSwitcher>
        <fieldset disabled={loading} style={{ border: 'none', padding: 0, margin: 0 }}>
          {tab === 'login' && (
            <form onSubmit={handleSubmit} autoComplete="off">
              <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <Input type="password" name="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
              <Button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
            </form>
          )}
          {tab === 'register' && (
            <form onSubmit={handleSubmit} autoComplete="off">
              <Input type="text" name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
              <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <Input type="password" name="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
              <Button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
            </form>
          )}
          {tab === 'forgot' && (
            <form onSubmit={handleSubmit} autoComplete="off">
              <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <Button type="submit" disabled={loading}>Recuperar Senha</Button>
            </form>
          )}
        </fieldset>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>
    </Container>
  );
}

export default LoginPage;
