import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { searchClientes } from '../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(21, 97, 111, 0.09);
  padding: 2rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  color: #1a3c40;
  margin: 0;
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #1a3c40;
  }
`;

const Button = styled.button`
  background-color: #1a3c40;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #15616f;
  }
`;

const ClienteTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    border: 1px solid #ddd;
    padding: 0.8rem;
    text-align: left;
    font-size: 0.9rem;
  }

  th {
    background-color: #f2f2f2;
    font-weight: 600;
    color: #333;
  }

  tr:nth-child(even) { background-color: #f9f9f9; }
  tr:hover { background-color: #f1f1f1; }
`;

const LoadingText = styled.p`
  text-align: center;
  padding: 2rem;
  color: #888;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  
  h3 {
    margin-bottom: 1rem;
  }
`;

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Função para buscar clientes
  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      setError('Digite pelo menos 3 caracteres para buscar');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchClientes(searchQuery);
      setClientes(results);
      if (results.length === 0) {
        setError('Nenhum cliente encontrado com esse termo');
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao buscar clientes. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para lidar com a mudança no campo de busca
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Função para lidar com o evento de pressionar Enter no campo de busca
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <Container>
      <HeaderContainer>
        <Title>Clientes</Title>
        <Button>Novo Cliente</Button>
      </HeaderContainer>
      
      <SearchContainer>
        <SearchInput 
          type="text" 
          placeholder="Digite nome ou CPF/CNPJ para buscar..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleSearch} style={{ marginTop: '1rem' }}>Buscar</Button>
      </SearchContainer>
      
      {isLoading ? (
        <LoadingText>Carregando clientes...</LoadingText>
      ) : error ? (
        <EmptyState>
          <h3>{error}</h3>
          <p>Tente uma nova busca ou cadastre um novo cliente.</p>
        </EmptyState>
      ) : clientes.length > 0 ? (
        <ClienteTable>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente._id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpfCnpj}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td>
                  <Button style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Ver Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </ClienteTable>
      ) : (
        <EmptyState>
          <h3>Nenhum cliente para mostrar</h3>
          <p>Faça uma busca para encontrar clientes ou cadastre um novo.</p>
        </EmptyState>
      )}
    </Container>
  );
} 