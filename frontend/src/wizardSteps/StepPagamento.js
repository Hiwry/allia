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
    forma: data.forma || '',
    valor: data.valor || '',
    status: data.status || 'pendente',
  });

  const novoPagamentoInicial = { forma: '', valor: '', dataPagamento: '', id: Date.now() };

  const [pagamentos, setPagamentos] = React.useState(
    (data?.pagamentos && data.pagamentos.length > 0) ? data.pagamentos : [novoPagamentoInicial]
  );

  const itens = data.itens || [];
  const aplicacoesPorItem = data.aplicacoesPorItem || {};

  const subtotalCostura = itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0);

  let subtotalPersonalizacao = 0;
  if (aplicacoesPorItem) {
    subtotalPersonalizacao = Object.entries(aplicacoesPorItem).reduce((sum, [itemId, aplicacoes]) => {
      const item = itens.find(i => String(i.id) === String(itemId) || i.id === itemId || i.id == itemId);
      const qtd = item && item.quantidade ? item.quantidade : 1;
      return sum + aplicacoes.reduce((s, aplic) => s + (aplic.valor || 0) * qtd, 0);
    }, 0);
  }

  const acrescimosTotais = itens.reduce((sum, item) => {
    if (item.acrescimos) {
      return sum + Object.values(item.acrescimos).reduce((a, b) => a + Number(b), 0);
    }
    return sum;
  }, 0);

  const subtotalGeral = subtotalCostura + subtotalPersonalizacao + acrescimosTotais;

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
    setPagamentos(pags => [...pags, { ...novoPagamentoInicial, id: Date.now() }]);
  };

  const handleRemovePagamento = idx => {
    setPagamentos(pags => pags.filter((_, i) => i !== idx));
  };

  const totalPagamentos = pagamentos.reduce((sum, p) => sum + Number(p.valor || 0), 0);
  const troco = totalPagamentos - subtotalGeral;

  const handleSubmit = e => {
    e.preventDefault();

    if (pagamentos.some(p => !p.forma || !p.valor || Number(p.valor) <= 0)) {
      alert('Preencha todos os métodos (forma) e valores de pagamento válidos (maiores que zero)!');
      return;
    }

    const pagamentosFormatados = pagamentos.map(({ id, valor, dataPagamento, forma, ...resto }) => ({
      ...resto,
      forma: forma,
      valor: Number(valor),
      dataPagamento: dataPagamento ? new Date(dataPagamento + 'T00:00:00') : null
    }));

    const totalPagoFormatado = pagamentosFormatados.reduce((sum, p) => sum + p.valor, 0);

    onNext({ pagamentos: pagamentosFormatados, faltaPagar: subtotalGeral - totalPagoFormatado });
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16, color: '#15616f', fontWeight: 500, fontSize: 17 }}>
        <div style={{ marginBottom: 10, fontWeight: 600 }}>Formas de Pagamento</div>
        {pagamentos.map((pag, idx) => (
          <Row key={pag.id} style={{ alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <Select
              value={pag.forma}
              onChange={e => handlePagamentoChange(idx, 'forma', e.target.value)}
              required
              style={{ minWidth: 180, flexBasis: '200px' }}
            >
              <option value="">Forma</option>
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
              style={{ maxWidth: 120, flexBasis: '120px' }}
            />
            <Input
              type="date"
              value={pag.dataPagamento || ''}
              onChange={e => handlePagamentoChange(idx, 'dataPagamento', e.target.value)}
              style={{ maxWidth: 150, flexBasis: '150px' }}
            />
            {pagamentos.length > 1 && (
              <Button type="button" style={{ background: '#e57373', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleRemovePagamento(idx)}>Remover</Button>
            )}
          </Row>
        ))}
        <Button type="button" style={{ background: '#64b5f6', marginTop: 10 }} onClick={handleAddPagamento}>+ Adicionar Pagamento</Button>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
          <div>Subtotal Costura: R$ {subtotalCostura.toFixed(2)}</div>
          <div>Subtotal Personalização: R$ {subtotalPersonalizacao.toFixed(2)}</div>
          <div style={{ color: '#f39c12', fontWeight: 700 }}>Subtotal Acréscimos: R$ {acrescimosTotais.toFixed(2)}</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>Total: R$ {subtotalGeral.toFixed(2)}</div>
          <div style={{ color: '#22a2a2', fontWeight: 600 }}>Total Pago: R$ {totalPagamentos.toFixed(2)}</div>
          {troco < -0.005 && <div style={{ color: '#d32f2f', fontWeight: 700 }}>Falta: R$ {Math.abs(troco).toFixed(2)}</div>}
          {troco > 0.005 && <div style={{ color: '#22a2a2', fontWeight: 700 }}>Troco: R$ {troco.toFixed(2)}</div>}
        </div>
      </div>
      <ButtonRow>
        <Button type="button" onClick={onBack} style={{ background: '#eee', color: '#15616f' }}>Voltar</Button>
        <Button type="submit">Próximo</Button>
      </ButtonRow>
    </Form>
  );
}
