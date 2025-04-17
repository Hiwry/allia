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

const Select = styled.select`
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
`;

export default function StepPagamento({ onNext, onBack, data }) {
  const [form, setForm] = React.useState({
    metodo: data.metodo || '',
    valor: data.valor || '',
    status: data.status || 'pendente',
  });

  const [pagamentos, setPagamentos] = React.useState([
    { metodo: '', valor: '', id: Date.now() }
  ]);

  // Calcular subtotais
  const itens = data.itens || [];
  // Personalização por item (wizard novo)
  const aplicacoesPorItem = data.aplicacoesPorItem || {};

  // Subtotal Costura
  const subtotalCostura = itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0);

  // Subtotal Personalização (todas aplicações de todos os itens)
  let subtotalPersonalizacao = 0;
  if (aplicacoesPorItem) {
    subtotalPersonalizacao = Object.entries(aplicacoesPorItem).reduce((sum, [itemId, aplicacoes]) => {
      // Procura quantidade do item correspondente
      const item = itens.find(i => String(i.id) === String(itemId) || i.id === itemId || i.id == itemId);
      const qtd = item && item.quantidade ? item.quantidade : 1;
      return sum + aplicacoes.reduce((s, aplic) => s + (aplic.valor || 0) * qtd, 0);
    }, 0);
  }

  // Acrescimos GG/EXG/G1+/G2+/G3+
  const acrescimosTotais = itens.reduce((sum, item) => {
    if (item.acrescimos) {
      return sum + Object.values(item.acrescimos).reduce((a, b) => a + Number(b), 0);
    }
    return sum;
  }, 0);

  // Subtotal geral
  const subtotalGeral = subtotalCostura + subtotalPersonalizacao + acrescimosTotais;

  // Atualiza pagamentos ao trocar subtotal
  React.useEffect(() => {
    setPagamentos(pags => {
      if (pags.length === 1) {
        return [{ ...pags[0], valor: subtotalGeral }];
      }
      return pags;
    });
  }, [subtotalGeral]);

  const handlePagamentoChange = (idx, field, value) => {
    setPagamentos(pags => pags.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleAddPagamento = () => {
    setPagamentos(pags => [...pags, { metodo: '', valor: '', id: Date.now() }]);
  };

  const handleRemovePagamento = idx => {
    setPagamentos(pags => pags.filter((_, i) => i !== idx));
  };

  const totalPagamentos = pagamentos.reduce((sum, p) => sum + Number(p.valor || 0), 0);
  const troco = totalPagamentos - subtotalGeral;

  const handleSubmit = e => {
    e.preventDefault();
    // Validação: todos métodos preenchidos, valores > 0
    if (pagamentos.some(p => !p.metodo || !p.valor || Number(p.valor) <= 0)) {
      alert('Preencha todos os métodos e valores válidos!');
      return;
    }
    // Permite seguir mesmo se valor pago for menor que o total
    // Passa valor de falta para próxima etapa
    onNext({ ...form, pagamentos, faltaPagar: subtotalGeral - totalPagamentos });
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Pagamentos múltiplos */}
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16, color: '#15616f', fontWeight: 500, fontSize: 17 }}>
        <div style={{ marginBottom: 10, fontWeight: 600 }}>Formas de Pagamento</div>
        {pagamentos.map((pag, idx) => (
          <Row key={pag.id} style={{ alignItems: 'center', marginBottom: 6 }}>
            <Select
              value={pag.metodo}
              onChange={e => handlePagamentoChange(idx, 'metodo', e.target.value)}
              required
              style={{ minWidth: 180 }}
            >
              <option value="">Método de Pagamento</option>
              <option value="dinheiro">Dinheiro/Espécie</option>
              <option value="entrada">Entrada em Dinheiro</option>
              <option value="transf">Transf Bancária</option>
              <option value="boleto">Boleto Bancário</option>
              <option value="debito">Débito Visa</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
            </Select>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor"
              value={pag.valor}
              onChange={e => handlePagamentoChange(idx, 'valor', e.target.value)}
              required
              style={{ maxWidth: 120 }}
            />
            {pagamentos.length > 1 && (
              <Button type="button" style={{ background: '#eee', color: '#d32f2f', marginLeft: 6 }} onClick={() => handleRemovePagamento(idx)}>-</Button>
            )}
          </Row>
        ))}
        <Button type="button" style={{ background: '#22a2a2', color: '#fff', marginTop: 8, marginBottom: 8 }} onClick={handleAddPagamento}>+ Adicionar Pagamento</Button>
        <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600 }}>
          Total informado: <span style={{ color: totalPagamentos === subtotalGeral ? '#22a2a2' : '#d32f2f' }}>R$ {totalPagamentos.toFixed(2)}</span>
        </div>
        {/* Resumo de pagamento/falta/troco */}
        {(() => {
          if (totalPagamentos < subtotalGeral) {
            return <div style={{ color: '#d32f2f', fontWeight: 700, marginTop: 4 }}>Falta pagar: R$ {(subtotalGeral - totalPagamentos).toFixed(2)}</div>;
          } else if (totalPagamentos > subtotalGeral) {
            return <div style={{ color: '#22a2a2', fontWeight: 700, marginTop: 4 }}>Troco: R$ {(totalPagamentos - subtotalGeral).toFixed(2)}</div>;
          } else if (totalPagamentos === subtotalGeral && subtotalGeral > 0) {
            return <div style={{ color: '#22a2a2', fontWeight: 700, marginTop: 4 }}>Pagamento completo</div>;
          }
          return null;
        })()}
      </div>
      <ButtonRow>
        <Button type="button" onClick={onBack} style={{ background: '#eee', color: '#15616f' }}>Voltar</Button>
        <Button type="submit">Próximo</Button>
      </ButtonRow>
    </Form>
  );
}
