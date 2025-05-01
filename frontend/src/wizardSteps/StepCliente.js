import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { searchClientes, createCliente } from '../services/api'; // Importar createCliente
import { debounce } from 'lodash'; // Importar debounce (assumindo que lodash está disponível)

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border || '#c2e3e3'};
  border-radius: 8px;
  font-size: 1rem;
`;

const Select = styled.select`
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border || '#c2e3e3'};
  border-radius: 8px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border || '#c2e3e3'};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
`;

const Button = styled.button`
  align-self: flex-end;
  background: ${({ theme, disabled }) => (disabled ? '#ccc' : theme.colors.primary || '#15616f')};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin-top: 1rem;
`;

const SaveButton = styled(Button)`
  background: ${({ theme, disabled }) => (disabled ? '#ccc' : theme.colors.secondary || '#28a745')}; /* Cor diferente para salvar */
  margin-right: 0.5rem; /* Espaço entre os botões */
`;

const SearchInput = styled(Input)`
  margin-bottom: 0.5rem; /* Espaço abaixo da busca */
`;

const SearchResults = styled.ul`
  list-style: none;
  padding: 0;
  margin: -0.5rem 0 1rem 0; /* Ajustar margem para ficar logo abaixo do input */
  border: 1px solid #eee;
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ResultItem = styled.li`
  padding: 0.6rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f0f8ff;
  }
`;

const ClientInfo = styled.div`
  background-color: #e7f7f7;
  border: 1px solid #c2e3e3;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
`;

// Sugestão de preenchimento automático
const AUTOFILL = {
  nome: 'Cliente Teste',
  cpfCnpj: '000.000.000-00',
  contato: '(11) 99999-9999',
  instagram: '@clienteteste',
  email: 'cliente@teste.com',
  endereco: 'Rua Exemplo, 123',
  categoria: 'particular',
  obs: 'Pedido gerado automaticamente para teste.'
};

export default function StepCliente({ onNext, data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState(data.clienteId || null);
  const [isNewClientMode, setIsNewClientMode] = useState(!selectedClienteId);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false); // **NOVO**: Estado de loading para salvar cliente

  // Estado para os dados do formulário (usado para novo cliente ou exibição do selecionado)
  const [form, setForm] = useState({
    nome: data.cliente?.nome || '', 
    tipoPessoa: data.cliente?.tipoPessoa || 'fisica',
    cpfCnpj: data.cliente?.cpfCnpj || '',
    telefone: data.cliente?.telefone || '',
    instagram: data.cliente?.instagram || '',
    email: data.cliente?.email || '',
    endereco: {
      rua: data.cliente?.endereco?.rua || '',
      numero: data.cliente?.endereco?.numero || '',
      complemento: data.cliente?.endereco?.complemento || '',
      bairro: data.cliente?.endereco?.bairro || '',
      cidade: data.cliente?.endereco?.cidade || '',
      estado: data.cliente?.endereco?.estado || 'AL',
      cep: data.cliente?.endereco?.cep || '',
    },
    categoria: data.cliente?.categoria || 'particular',
    obs: data.cliente?.obs || '',
  });

  // Função debounced para buscar clientes
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query && query.length >= 3) {
        setIsLoadingSearch(true);
        const results = await searchClientes(query);
        setSearchResults(results);
        setIsLoadingSearch(false);
      } else {
        setSearchResults([]);
      }
    }, 500), // Espera 500ms após parar de digitar
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    // Cleanup debounce on unmount
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  // Função para preencher form com dados do cliente selecionado
  const fillFormWithSelected = (cliente) => {
     setForm({
        _id: cliente._id,
        nome: cliente.nome || '',
        tipoPessoa: cliente.tipoPessoa || 'fisica',
        cpfCnpj: cliente.cpfCnpj || '',
        telefone: cliente.telefone || '',
        instagram: cliente.instagram || '',
        email: cliente.email || '',
        endereco: { 
            rua: cliente.endereco?.rua || '', 
            numero: cliente.endereco?.numero || '', 
            complemento: cliente.endereco?.complemento || '', 
            bairro: cliente.endereco?.bairro || '', 
            cidade: cliente.endereco?.cidade || '', 
            estado: cliente.endereco?.estado || 'AL', 
            cep: cliente.endereco?.cep || '' 
        }, 
        categoria: cliente.categoria || 'particular',
        obs: cliente.obs || '',
     });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedClienteId(null); // Limpa seleção ao digitar nova busca
    setIsNewClientMode(true); // Volta pro modo novo cliente ao buscar
  };

  const handleSelectClient = (cliente) => {
    setSelectedClienteId(cliente._id);
    setSearchQuery(''); // Limpa busca
    setSearchResults([]); // Limpa resultados
    setIsNewClientMode(false); // Sai do modo novo cliente
    fillFormWithSelected(cliente); // Preenche display com dados selecionados (opcional)
    console.log("Cliente selecionado ID:", cliente._id);
  };

  const handleEnterNewClientMode = () => {
     setSelectedClienteId(null);
     setIsNewClientMode(true);
     // Limpar formulário para nova entrada
     setForm({ 
        nome: '', tipoPessoa: 'fisica', cpfCnpj: '', telefone: '', 
        instagram: '', email: '', endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'AL', cep: '' }, 
        categoria: 'particular', obs: '' 
     });
  };
  
  const handleChange = e => {
    const { name, value } = e.target;
    if (!isNewClientMode) return; // Não permite editar se um cliente foi selecionado

    if (['rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep'].includes(name)) {
      setForm(prevForm => ({ ...prevForm, endereco: { ...prevForm.endereco, [name]: value } }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  
  // **NOVO**: Função para salvar apenas o cliente
  const handleSaveCliente = async () => {
    if (!isNewClientMode) return;
    if (!form.nome || !form.cpfCnpj || !form.telefone || !form.tipoPessoa) { // Validar campos essenciais
        alert('Preencha os campos obrigatórios do novo cliente (Nome, CPF/CNPJ, Telefone, Tipo).');
        return;
    }
    setIsSavingClient(true);
    try {
        const response = await createCliente(form);
        const savedOrExistingClient = response.data; // API retorna o cliente salvo ou o existente (se status 201 ou 409)
        
        if (response.status === 201) {
             alert(`Cliente "${savedOrExistingClient.nome}" salvo com sucesso!`);
             handleSelectClient(savedOrExistingClient); // Seleciona o cliente recém-criado
        } else if (response.status === 409) {
             alert(`Cliente "${savedOrExistingClient.cliente?.nome || form.nome}" já existe com este CPF/CNPJ. Selecionando cliente existente.`);
             // A API clientes.js retorna { message, cliente } no 409
             handleSelectClient(savedOrExistingClient.cliente); // Seleciona o cliente existente retornado pela API
        } else {
             // Caso inesperado (a API deveria retornar 201 ou 409 ou erro)
             console.error("Resposta inesperada ao salvar cliente:", response);
             alert("Erro inesperado ao salvar cliente. Status: " + response.status);
        }
        
    } catch (error) {
        console.error("Erro ao salvar cliente:", error.response?.data || error.message);
        let errorMsg = "Erro ao salvar cliente.";
        if (error.response?.status === 409) {
            // Se o erro for 409, mas a API não retornou o cliente (fallback)
            errorMsg = error.response.data.message || 'Cliente com este CPF/CNPJ já existe.';
            // Tentar buscar e selecionar? Ou apenas alertar? Por enquanto, só alerta.
        } else if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
            if(error.response.data.errors) {
                 const fields = Object.keys(error.response.data.errors).join(', ');
                 errorMsg += ` Erro de validação nos campos: ${fields}.`;
            }
        } else {
            errorMsg = error.message;
        }
        alert(errorMsg);
    } finally {
        setIsSavingClient(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (selectedClienteId) {
      // **MODIFICADO**: Enviar o objeto cliente completo (que está no form state) 
      // em vez de apenas o ID. O backend tratará de usar o ID ou os dados.
      onNext({ cliente: form }); 
    } else if (isNewClientMode) {
      // Se está no modo novo cliente, valida e envia o objeto completo
      if (!form.nome || !form.cpfCnpj || !form.telefone || !form.email || !form.tipoPessoa) { 
          alert('Preencha os campos obrigatórios do novo cliente antes de prosseguir.');
          return;
      }
      onNext({ cliente: form }); 
    } else {
        alert("Erro: Nenhum cliente selecionado ou modo inválido.");
    }
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Busca de Cliente */}
      <Row>
          <SearchInput 
            name="search" 
            placeholder="Buscar cliente por nome ou CPF/CNPJ..." 
            value={searchQuery} 
            onChange={handleSearchChange} 
            style={{flex: 2}}
          />
           <Button type="button" onClick={handleEnterNewClientMode} style={{background: '#6c757d', flex: 1}}>Limpar / Novo Cliente</Button>
      </Row>
      {isLoadingSearch && <div style={{fontSize: '0.9em', color: '#888'}}>Buscando...</div>}
      {searchResults.length > 0 && (
        <SearchResults>
          {searchResults.map(cliente => (
            <ResultItem key={cliente._id} onClick={() => handleSelectClient(cliente)}>
              {cliente.nome} ({cliente.cpfCnpj}) - {cliente.telefone}
            </ResultItem>
          ))}
        </SearchResults>
      )}

      {/* Exibição/Edição dos Dados */} 
      <fieldset disabled={!isNewClientMode && selectedClienteId} style={{border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
          
          {selectedClienteId && !isNewClientMode && (
              <ClientInfo>
                  <b>Cliente Selecionado:</b> {form.nome} ({form.cpfCnpj})
              </ClientInfo>
          )}

          {/* Inputs (desabilitados se cliente selecionado) */} 
          <Row>
            <Input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required disabled={!isNewClientMode} />
            <Select name="tipoPessoa" value={form.tipoPessoa} onChange={handleChange} required disabled={!isNewClientMode}>
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </Select>
          </Row>
          <Row>
            <Input name="cpfCnpj" placeholder={form.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'} value={form.cpfCnpj} onChange={handleChange} required disabled={!isNewClientMode} />
            <Input name="telefone" placeholder="Telefone (com DDD)" value={form.telefone} onChange={handleChange} required disabled={!isNewClientMode} /> 
          </Row>
          <Row>
            <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required disabled={!isNewClientMode} />
            <Input name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} disabled={!isNewClientMode} />
          </Row>
          <Row>
            <Input name="rua" placeholder="Rua/Avenida" value={form.endereco.rua} onChange={handleChange} style={{ flex: 3 }} disabled={!isNewClientMode} />
            <Input name="numero" placeholder="Número" value={form.endereco.numero} onChange={handleChange} style={{ flex: 1 }} disabled={!isNewClientMode} />
          </Row>
          <Row>
            <Input name="complemento" placeholder="Complemento (Opcional)" value={form.endereco.complemento} onChange={handleChange} style={{ flex: 2 }} disabled={!isNewClientMode} />
            <Input name="bairro" placeholder="Bairro" value={form.endereco.bairro} onChange={handleChange} style={{ flex: 2 }} disabled={!isNewClientMode} />
          </Row>
          <Row>
            <Input name="cidade" placeholder="Cidade" value={form.endereco.cidade} onChange={handleChange} style={{ flex: 2 }} disabled={!isNewClientMode} />
            <Input name="estado" placeholder="Estado (UF)" value={form.endereco.estado} onChange={handleChange} maxLength={2} style={{ flex: 1 }} disabled={!isNewClientMode} />
            <Input name="cep" placeholder="CEP" value={form.endereco.cep} onChange={handleChange} style={{ flex: 1 }} disabled={!isNewClientMode} />
          </Row>
          <Row>
            <Select name="categoria" value={form.categoria} onChange={handleChange} disabled={!isNewClientMode}>
              <option value="particular">Particular</option>
              <option value="empresa">Empresa</option>
              <option value="escola">Escola</option>
              <option value="outros">Outros</option>
            </Select>
          </Row>
          <Row>
            <Textarea name="obs" placeholder="Observações" rows={2} value={form.obs} onChange={handleChange} disabled={!isNewClientMode} />
          </Row>
      </fieldset>

      {/* Botões Salvar e Próximo */}
      <Row style={{justifyContent: 'flex-end'}}>
         {isNewClientMode && (
            <SaveButton 
              type="button" 
              onClick={handleSaveCliente} 
              disabled={isSavingClient || !isNewClientMode}
            >
              {isSavingClient ? 'Salvando...' : 'Salvar Cliente'}
            </SaveButton>
         )}
        <Button type="submit" disabled={isSavingClient}>
            Próximo
        </Button>
      </Row>
    </Form>
  );
}
