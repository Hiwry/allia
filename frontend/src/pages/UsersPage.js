import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';

const Container = styled.main`
  margin: 0 auto;
  max-width: 900px;
  padding: 48px 32px 32px 32px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #172a3a;
  margin-bottom: 32px;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 10px;
  color: #22344a;
  font-size: 1.08rem;
  font-weight: 600;
  border-bottom: 2px solid #e4e9ef;
  background: #f7fafc;
`;

const Td = styled.td`
  padding: 14px 10px;
  color: #22344a;
  font-size: 1.05rem;
  border-bottom: 1px solid #f1f3f7;
`;

const Row = styled.tr`
  &:hover {
    background: #f7fafc;
  }
`;

const Actions = styled.td`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  background: #172a3a;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s;
  &:hover { background: #22344a; }
`;

const Placeholder = styled.div`
  color: #8fa1b3;
  font-size: 1.1rem;
  padding: 20px 0;
`;

const Form = styled.form`
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  border: 1px solid #e4e9ef;
  margin-bottom: 32px;
  padding: 24px 24px 12px 24px;
  display: flex;
  gap: 18px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const Input = styled.input`
  border: 1px solid #cfd8dc;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 1rem;
  outline: none;
  min-width: 180px;
`;

const Select = styled.select`
  border: 1px solid #cfd8dc;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 1rem;
  outline: none;
  min-width: 140px;
`;

// Simulação de dados de usuários
const MOCK_USERS = [
  { id: 1, nome: 'Admin', email: 'admin@email.com', tipo: 'Administrador' },
  { id: 2, nome: 'João Silva', email: 'joao@email.com', tipo: 'Operador' },
  { id: 3, nome: 'Maria Souza', email: 'maria@email.com', tipo: 'Operador' },
  { id: 4, nome: 'teste', email: 'teste@email.com', tipo: 'Operador' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', tipo: 'Operador' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', tipo: 'Operador' });

  useEffect(() => {
    setUsers(MOCK_USERS);
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.email) return;
    setUsers(prev => [
      ...prev,
      { id: Date.now(), ...form }
    ]);
    setForm({ nome: '', email: '', tipo: 'Operador' });
  }

  function handleEditClick(user) {
    setEditId(user.id);
    setEditForm({ nome: user.nome, email: user.email, tipo: user.tipo });
  }

  function handleEditChange(e) {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleEditSave() {
    setUsers(users.map(u => u.id === editId ? { ...u, ...editForm } : u));
    setEditId(null);
  }

  function handleEditCancel() {
    setEditId(null);
  }

  return (
    <Layout>
      <Container>
        <Title>Usuários</Title>
        <Form onSubmit={handleSubmit}>
          <Input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Select name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="Operador">Operador</option>
            <option value="Administrador">Administrador</option>
          </Select>
          <Button type="submit">Adicionar Usuário</Button>
        </Form>
        {users.length === 0 ? (
          <Placeholder>Nenhum usuário cadastrado.</Placeholder>
        ) : (
          <UserTable>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Tipo</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <Row key={user.id}>
                  {editId === user.id ? (
                    <>
                      <Td><Input name="nome" value={editForm.nome} onChange={handleEditChange} /></Td>
                      <Td><Input name="email" value={editForm.email} onChange={handleEditChange} /></Td>
                      <Td>
                        <Select name="tipo" value={editForm.tipo} onChange={handleEditChange}>
                          <option value="Operador">Operador</option>
                          <option value="Administrador">Administrador</option>
                        </Select>
                      </Td>
                      <Actions>
                        <Button style={{background:'#22a2a2'}} onClick={handleEditSave} type="button">Salvar</Button>
                        <Button style={{background:'#b0bec5', color:'#22344a'}} onClick={handleEditCancel} type="button">Cancelar</Button>
                      </Actions>
                    </>
                  ) : (
                    <>
                      <Td>{user.nome}</Td>
                      <Td>{user.email}</Td>
                      <Td>{user.tipo}</Td>
                      <Actions>
                        <Button onClick={() => handleEditClick(user)} type="button">Editar</Button>
                        <Button style={{background:'#d32f2f'}}>Excluir</Button>
                      </Actions>
                    </>
                  )}
                </Row>
              ))}
            </tbody>
          </UserTable>
        )}
      </Container>
    </Layout>
  );
}
