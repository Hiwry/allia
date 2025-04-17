import React from 'react';
import styled from 'styled-components';

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
  background: ${({ theme }) => theme.colors.primary || '#15616f'};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
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
  const [form, setForm] = React.useState({
    nome: data.nome || '',
    cpfCnpj: data.cpfCnpj || '',
    contato: data.contato || '',
    instagram: data.instagram || '',
    email: data.email || '',
    endereco: data.endereco || '',
    categoria: data.categoria || '',
    obs: data.obs || '',
  });

  // Preencher automaticamente ao montar se algum campo estiver vazio
  React.useEffect(() => {
    if (!form.nome || !form.cpfCnpj || !form.contato || !form.email) {
      setForm(f => ({ ...AUTOFILL, ...f }));
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAutofill = () => {
    setForm(AUTOFILL);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Validação simples
    if (!form.nome || !form.cpfCnpj || !form.contato || !form.email) return;
    onNext(form);
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <Row>
        <Input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
        <Input name="cpfCnpj" placeholder="CPF/CNPJ" value={form.cpfCnpj} onChange={handleChange} required />
      </Row>
      <Row>
        <Input name="contato" placeholder="Contato" value={form.contato} onChange={handleChange} required />
        <Input name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} />
      </Row>
      <Row>
        <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
        <Input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />
      </Row>
      <Row>
        <Select name="categoria" value={form.categoria} onChange={handleChange} required>
          <option value="">Categoria do cliente</option>
          <option value="particular">Particular</option>
          <option value="empresa">Empresa</option>
          <option value="escola">Escola</option>
          <option value="outros">Outros</option>
        </Select>
      </Row>
      <Row>
        <Textarea name="obs" placeholder="Observações" rows={2} value={form.obs} onChange={handleChange} />
      </Row>
      <Row>
        <Button type="button" style={{background:'#e7f7f7',color:'#15616f',marginRight:16}} onClick={handleAutofill}>Preencher automaticamente</Button>
        <Button type="submit">Próximo</Button>
      </Row>
    </Form>
  );
}
