import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/usersApi';

const Wrapper = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(21, 97, 111, 0.09);
  padding: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  th, td { border: 1px solid #ddd; padding: 0.7rem; text-align: left; }
  th { background: #f2f2f2; }
`;

const StyledForm = styled.form`
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.5rem 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(21,97,111,0.06);
`;
const StyledInput = styled.input`
  padding: 0.7rem 1rem;
  border: 1.5px solid #d1e3ea;
  border-radius: 8px;
  font-size: 1rem;
  margin-right: 0.7rem;
  min-width: 140px;
  background: #fff;
  transition: border 0.2s;
  &:focus { border-color: #15616f; }
`;
const StyledButton = styled.button`
  background: #15616f;
  color: #fff;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 7px;
  font-weight: 600;
  font-size: 1rem;
  margin-left: 0.5rem;
  transition: background 0.2s;
  &:hover { background: #104e5e; }
`;
const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #15616f; }
`;
const CancelButton = styled(StyledButton)`
  background: #e9ecef;
  color: #15616f;
  margin-left: 0.5rem;
  &:hover { background: #d1e3ea; }
`;
const RoleSelect = styled.select`
  margin-left: 0.5rem;
`;
const FuncoesSelect = styled.select`
  margin-left: 0.5rem;
  min-width: 160px;
`;

const AddButton = styled.button`
  background: #15616f; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer;
  margin-bottom: 1rem;
`;

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'producao', label: 'Produção' },
];

const funcoesProducao = [
  { value: 'manager', label: 'Manager Produção' },
  { value: 'corte', label: 'Corte' },
  { value: 'costura', label: 'Costura' },
  { value: 'serigrafia', label: 'Serigrafia' },
  { value: 'sublimacao', label: 'Sublimação' },
  { value: 'bordado', label: 'Bordado' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'entrega', label: 'Entrega' },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', loja: '', role: 'vendedor', funcoesProducao: [] });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao buscar usuários: ' + (err.message || 'Erro desconhecido'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInput = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleRoleChange = e => {
    const role = e.target.value;
    setForm(f => ({ ...f, role, funcoesProducao: role === 'producao' ? [] : [] }));
  };

  const handleFuncoesChange = e => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(f => ({ ...f, funcoesProducao: options }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    console.log('[DEBUG] handleSubmit called. Editing ID:', editingId);
    console.log('[DEBUG] Form data being sent:', form);
    try {
      let response;
      if (editingId) {
        console.log(`[DEBUG] Calling updateUser for ID: ${editingId}`);
        response = await updateUser(editingId, form);
        console.log('[DEBUG] updateUser response:', response);
      } else {
        console.log('[DEBUG] Calling createUser...');
        response = await createUser(form);
        console.log('[DEBUG] createUser response:', response);
      }
      setForm({ name: '', email: '', password: '', loja: '', role: 'vendedor', funcoesProducao: [] });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error('[DEBUG] Error submitting user form:', err);
      const apiErrorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(`Erro ao salvar usuário: ${apiErrorMessage}`);
    }
  };

  const handleEdit = user => {
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      loja: user.loja || '',
      role: user.role,
      funcoesProducao: user.funcoesProducao || [],
    });
    setEditingId(user._id);
  };

  const handleDelete = async id => {
    if (window.confirm('Excluir este usuário?')) {
      await deleteUser(id);
      fetchUsers();
    }
  };

  return (
    <Wrapper>
      <h1 style={{marginBottom:12}}>Usuários</h1>
      <StyledForm onSubmit={handleSubmit}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <StyledInput name="name" placeholder="Nome" value={form.name} onChange={handleInput} required />
          <StyledInput name="email" placeholder="Email" value={form.email} onChange={handleInput} required type="email" />
          <StyledInput name="password" placeholder={editingId ? "Nova Senha (opcional)" : "Senha"} value={form.password} onChange={handleInput} type="password" required={!editingId} />
          <StyledInput name="loja" placeholder="Loja" value={form.loja} onChange={handleInput} />
          <RoleSelect name="role" value={form.role} onChange={handleRoleChange} required>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </RoleSelect>
          {form.role === 'producao' && (
            <FuncoesSelect name="funcoesProducao" value={form.funcoesProducao} onChange={handleFuncoesChange} multiple size={3}>
              {funcoesProducao.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </FuncoesSelect>
          )}
          <StyledButton type="submit">{editingId ? 'Salvar' : 'Criar'}</StyledButton>
          {editingId && <CancelButton type="button" onClick={()=>{setEditingId(null);setForm({name:'',email:'',password:'',loja:'',role:'vendedor',funcoesProducao:[]});}}>Cancelar</CancelButton>}
        </div>
      </StyledForm>
      <StyledButton style={{marginBottom:18}} onClick={()=>{setEditingId(null);setForm({name:'',email:'',password:'',loja:'',role:'vendedor',funcoesProducao:[]});}}>+ Novo Usuário</StyledButton>
      {loading ? <p>Carregando...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
      <Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Loja</th>
            <th>Role</th>
            <th>Funções Produção</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.map(user => (
            <tr key={user._id} style={editingId===user._id?{background:'#eaf6fa'}:{}}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.loja}</td>
              <td>{roles.find(r=>r.value===user.role)?.label || user.role}</td>
              <td>{user.funcoesProducao?.map(f=>funcoesProducao.find(fp=>fp.value===f)?.label||f).join(', ')}</td>
              <td>
                <ActionButton onClick={()=>handleEdit(user)} title="Editar">✏️</ActionButton>
                <ActionButton onClick={()=>handleDelete(user._id)} title="Excluir" style={{color:'#ea4335',marginLeft:6}}>🗑️</ActionButton>
              </td>
            </tr>
          ))}
          {!loading && !error && Array.isArray(users) && users.length === 0 && (
            <tr>
              <td colSpan="6" style={{textAlign: 'center', color: '#888'}}>Nenhum usuário encontrado.</td>
            </tr>
          )}
        </tbody>
      </Table>
      )}
    </Wrapper>
  );
}
