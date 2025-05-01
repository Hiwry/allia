import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getCatalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, reorderCatalogItems, uploadImage } from '../services/catalogApi';

const Container = styled.main`
  margin: 0 auto;
  max-width: 950px;
  padding: 48px 32px 32px 32px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #15616f;
  margin-bottom: 32px;
  text-align: center;
`;

const SectionCard = styled.section`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(23, 42, 58, 0.08);
  margin-bottom: 48px;
  padding: 24px 28px;
  border-top: 4px solid #15616f;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #15616f;
  margin-bottom: 24px;
  border-bottom: 1px solid #e4e9ef;
  padding-bottom: 12px;
`;

const AddFormContainer = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 28px;
  border: 1px solid #e4e9ef;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-end;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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
  vertical-align: middle;
`;

const Img = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  background: #f8f9fa;
  box-shadow: 0 1px 6px #c2e3e366;
`;

const Button = styled.button`
  background: #15616f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, transform 0.1s;
  &:hover { 
    background: #104e5e; 
    transform: translateY(-1px);
  }
  &:disabled {
    background: #b0bec5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #e4e9ef;
  color: #455a64;
  &:hover {
    background: #cfd8dc;
    color: #263238;
  }
`;

const DangerButton = styled(Button)`
  background: #fbe9e7;
  color: #d9534f;
  border: 1px solid #ffccbc;
  &:hover {
    background: #ffccbc;
    color: #c9302c;
  }
`;

const Input = styled.input`
  border: 1.5px solid #cfd8dc;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 1rem;
  outline: none;
  min-width: 100px;
  transition: border-color 0.2s;
  &:focus {
    border-color: #15616f;
  }
`;

const FileInputLabel = styled.label`
  background: #e4e9ef;
  color: #455a64;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.18s;
  &:hover { background: #cfd8dc; }
`;

const ErrorMsg = styled.div`
  color: #c9302c;
  font-size: 0.9rem;
  margin-top: 8px;
`;

const gruposValidos = ['gola', 'detalhe', 'tecido', 'corte', 'personalizacao', 'cor', 'tipoMalha'];

const grupos = [
  { key: 'gola', label: 'Golas', fields: ['nome', 'valor', 'imagem'] },
  { key: 'detalhe', label: 'Detalhes', fields: ['nome', 'valor', 'imagem'] },
  { key: 'tecido', label: 'Tecidos', fields: ['nome', 'personalizacoes'] },
  { key: 'corte', label: 'Tipos de Corte', fields: ['nome', 'valor', 'tipoMalha'] },
  { key: 'personalizacao', label: 'Tipos de Personalização', fields: ['nome'] },
  { key: 'cor', label: 'Cores', fields: ['nome', 'rgb', 'tipoMalha', 'corClara'] },
  { key: 'tipoMalha', label: 'Tipos de Tecido', fields: ['nome', 'tecidos'] }
];

// NOVO: Container para os botões de ação
const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // Espaçamento entre os botões
`;

export default function CatalogoItensPage() {
  const [catalogItems, setCatalogItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState({});
  const [form, setForm] = useState({});
  const [addForm, setAddForm] = useState({});
  const [catalogErrors, setCatalogErrors] = useState({});

  useEffect(() => {
    document.body.style.background = '#f4f7f9';
  }, []);

  useEffect(() => {
    grupos.forEach(async ({ key }) => {
      setLoading(true);
      setCatalogErrors(errs => ({ ...errs, [key]: null }));
      if (!gruposValidos.includes(key)) {
        setCatalogErrors(errs => ({ ...errs, [key]: `Grupo inválido: ${key}` }));
        setLoading(false);
        return;
      }
      try {
        const items = await getCatalog(key);
        setCatalogItems(itemsObj => ({ ...itemsObj, [key]: items }));
        setCatalogErrors(errs => ({ ...errs, [key]: null }));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setCatalogErrors(errs => ({ ...errs, [key]: `Grupo não encontrado no backend: ${key}` }));
        } else {
          setCatalogErrors(errs => ({ ...errs, [key]: 'Erro desconhecido ao buscar catálogo.' }));
        }
      }
      setLoading(false);
    });
  }, []);

  function handleEditClick(grupo, item) {
    setEdit(e => ({ ...e, [grupo]: item._id }));
    setForm(f => ({ ...f, [grupo]: { ...item } }));
  }

  function handleEditChange(grupo, e) {
    const { name, value, files, type, checked } = e.target;
    if (name === 'imagem' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, [grupo]: { ...f[grupo], imagem: file, preview: reader.result } }));
      };
      reader.readAsDataURL(file);
    } else if (type === 'color') {
      setForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: value } }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: !!checked } }));
    } else if (e.target.multiple) {
      // Lidar com selects múltiplos, convertendo para array
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      setForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: selectedOptions } }));
    } else {
      setForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: value } }));
    }
  }

  async function handleEditSave(grupo, item) {
    setLoading(true);
    try {
      console.log('[DEBUG] Salvando edição:', { grupo, id: item._id, data: form[grupo] });
      await updateCatalogItem(item._id, form[grupo]);
      const items = await getCatalog(grupo);
      setCatalogItems(itemsObj => ({ ...itemsObj, [grupo]: items }));
      setEdit(e => ({ ...e, [grupo]: null }));
      setCatalogErrors(errs => ({ ...errs, [grupo]: null }));
    } catch (err) {
      console.error('[ERRO] Falha ao salvar edição:', err);
      setCatalogErrors(errs => ({ ...errs, [grupo]: 'Erro ao salvar edição. Veja o console.' }));
    }
    setLoading(false);
  }

  function handleEditCancel(grupo) {
    setEdit(e => ({ ...e, [grupo]: null }));
  }

  function handleAddChange(grupo, e) {
    const { name, value, files, type, checked } = e.target;
    if (name === 'imagem' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAddForm(f => ({ ...f, [grupo]: { ...f[grupo], imagem: file, preview: reader.result } }));
      };
      reader.readAsDataURL(file);
    } else if (type === 'color') {
      setAddForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: value } }));
    } else if (type === 'checkbox') {
      setAddForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: !!checked } }));
    } else if (e.target.multiple) {
      // Lidar com selects múltiplos, convertendo para array
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      setAddForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: selectedOptions } }));
    } else {
      setAddForm(f => ({ ...f, [grupo]: { ...f[grupo], [name]: value } }));
    }
  }

  async function handleAddSave(grupo, e) {
    e.preventDefault();
    setLoading(true);
    if (!grupo || !gruposValidos.includes(grupo)) {
      setCatalogErrors(errs => ({ ...errs, [grupo]: `Grupo inválido ao adicionar: ${grupo}` }));
      setLoading(false);
      return;
    }
    let item = addForm[grupo] || {};
    if (!item.nome || item.nome.trim() === '') {
      setCatalogErrors(errs => ({ ...errs, [grupo]: 'O campo nome é obrigatório.' }));
      setLoading(false);
      return;
    }
    let imagemUrl = undefined;
    if ((grupo === 'gola' || grupo === 'detalhe') && item.imagem && item.imagem instanceof File) {
      try {
        imagemUrl = await uploadImage(item.imagem);
      } catch {
        setCatalogErrors(errs => ({ ...errs, [grupo]: 'Erro ao fazer upload da imagem.' }));
        setLoading(false);
        return;
      }
    }
    if (typeof item.valor === 'string') {
      item.valor = parseFloat(item.valor.replace(',', '.'));
    }
    if (grupo === 'corte') {
      if (!Array.isArray(item.tipoMalha)) {
        if (typeof item.tipoMalha === 'string' && item.tipoMalha) {
          item.tipoMalha = [item.tipoMalha];
        } else if (!item.tipoMalha) {
          item.tipoMalha = [];
        }
      }
    }
    try {
      await addCatalogItem(grupo, { ...item, imagem: imagemUrl || item.imagem });
      const items = await getCatalog(grupo);
      setCatalogItems(itemsObj => ({ ...itemsObj, [grupo]: items }));
      setAddForm(f => ({ ...f, [grupo]: {} }));
      setCatalogErrors(errs => ({ ...errs, [grupo]: null }));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCatalogErrors(errs => ({ ...errs, [grupo]: `Erro 404 ao adicionar no grupo: ${grupo}` }));
      } else {
        setCatalogErrors(errs => ({ ...errs, [grupo]: 'Erro desconhecido ao adicionar item. Verifique o console.' }));
      }
    }
    setLoading(false);
  }

  async function handleDelete(grupo, id) {
    setLoading(true);
    await deleteCatalogItem(id);
    const items = await getCatalog(grupo);
    setCatalogItems(itemsObj => ({ ...itemsObj, [grupo]: items }));
    setLoading(false);
  }

  function handleReorder(grupo, newOrder) {
    setCatalogItems(itemsObj => ({ ...itemsObj, [grupo]: newOrder }));
    reorderCatalogItems(grupo, newOrder.map((item, idx) => ({ id: item._id, ordem: idx })));
  }

  function formatBRL(valor) {
    if (valor === undefined || valor === null || valor === '') return '';
    const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    if (isNaN(num)) return valor;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Utilitário para garantir URL absoluta da imagem
  function getImagemUrl(imagem) {
    if (!imagem) return '';
    if (imagem.startsWith('http')) return imagem;
    if (imagem.startsWith('/uploads/')) return `https://allia.onrender.com${imagem}`;
    return `https://allia.onrender.com/uploads/${imagem}`;
  }

  const tiposMalhaCatalog = catalogItems['tipoMalha'] || [];
  const tecidosOptions = catalogItems['tecido'] || [];
  const personalizacaoOptions = catalogItems['personalizacao'] || [];

  // Renderização sem layout condicional
  return (
    <Container>
      <Title>Catálogo de Itens</Title>

      {grupos.map(({ key, label, fields }) => (
        <SectionCard key={key}>
          <SectionTitle>{label}</SectionTitle>
          
          <AddFormContainer>
            <form onSubmit={(e) => handleAddSave(key, e)} autoComplete="off">
              <FormRow>
                {fields.includes('nome') && (
                  <Input
                    type="text"
                    name="nome"
                    placeholder="Nome"
                    value={addForm[key]?.nome || ''}
                    onChange={(e) => handleAddChange(key, e)}
                    required
                    style={{flexGrow: 2}}
                  />
                )}
                {fields.includes('valor') && (
                  <Input
                    type="number"
                    step="0.01"
                    name="valor"
                    placeholder="Valor (R$)"
                    value={addForm[key]?.valor || ''}
                    onChange={(e) => handleAddChange(key, e)}
                    style={{maxWidth: '120px'}}
                  />
                )}
                {fields.includes('rgb') && (
                  <Input
                    type="color"
                    name="rgb"
                    title="Cor RGB"
                    value={addForm[key]?.rgb || '#ffffff'}
                    onChange={(e) => handleAddChange(key, e)}
                    style={{ padding: '4px', height: '40px'}}
                  />
                )}
                 {fields.includes('corClara') && (
                   <label style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                     <input 
                       type="checkbox" 
                       name="corClara" 
                       checked={!!addForm[key]?.corClara}
                       onChange={(e) => handleAddChange(key, e)}
                     /> Cor Clara?
                   </label>
                )}
                {fields.includes('tipoMalha') && key !== 'cor' && (
                  <select 
                    name="tipoMalha" 
                    value={addForm[key]?.tipoMalha || ''} 
                    onChange={(e) => handleAddChange(key, e)} 
                    style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc' }}
                  >
                    <option value="">Selecione Tipo Malha</option>
                    {tiposMalhaCatalog.map(tm => <option key={tm._id} value={tm.nome}>{tm.nome}</option>)}
                  </select>
                )}
                 {fields.includes('tipoMalha') && key === 'cor' && (
                    <select 
                        name="tipoMalha" 
                        value={Array.isArray(addForm[key]?.tipoMalha) ? addForm[key]?.tipoMalha : []}
                        onChange={(e) => handleAddChange(key, e)} 
                        multiple
                        size="3"
                        style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc', minWidth: '150px' }}
                    >
                         {tiposMalhaCatalog.map(tm => <option key={tm._id} value={tm.nome}>{tm.nome}</option>)}
                    </select>
                 )}
                 {fields.includes('tecidos') && (
                     <select 
                        name="tecidos" 
                        value={Array.isArray(addForm[key]?.tecidos) ? addForm[key]?.tecidos : []} 
                        onChange={(e) => handleAddChange(key, e)} 
                        multiple
                        size="3"
                        style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc', minWidth: '150px' }}
                     >
                         {tecidosOptions.map(t => <option key={t._id} value={t.nome}>{t.nome}</option>)}
                     </select>
                 )}
                 {fields.includes('personalizacoes') && (
                     <select 
                        name="personalizacoes" 
                        multiple
                        value={Array.isArray(addForm[key]?.personalizacoes) ? addForm[key]?.personalizacoes : []}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                          handleAddChange(key, { target: { name: 'personalizacoes', value: options } });
                        }}
                        style={{ minWidth: '200px', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc' }}
                     >
                         {personalizacaoOptions.map(p => <option key={p._id} value={p.nome}>{p.nome}</option>)}
                     </select>
                 )}
                {fields.includes('imagem') && (
                  <>
                    <FileInputLabel htmlFor={`add-imagem-${key}`}>
                      {addForm[key]?.imagem ? 'Trocar Imagem' : 'Selecionar Imagem'}
                    </FileInputLabel>
                    <Input
                      type="file"
                      name="imagem"
                      id={`add-imagem-${key}`}
                      accept="image/*"
                      onChange={(e) => handleAddChange(key, e)}
                      style={{ display: 'none' }}
                    />
                    {addForm[key]?.preview && <Img src={addForm[key]?.preview} alt="Preview" />}
                  </>
                )}
                <Button type="submit" disabled={loading} style={{ marginLeft: 'auto' }}>
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </FormRow>
              {catalogErrors[key] && <ErrorMsg>{catalogErrors[key]}</ErrorMsg>}
            </form>
          </AddFormContainer>

          <Table>
            <thead>
              <tr>
                {fields.includes('imagem') && <Th style={{ width: '70px' }}>Imagem</Th>}
                {fields.includes('nome') && <Th>Nome</Th>}
                {fields.includes('valor') && <Th style={{ width: '100px' }}>Valor</Th>}
                {fields.includes('rgb') && <Th style={{ width: '70px' }}>Cor</Th>}
                {fields.includes('corClara') && <Th style={{ width: '100px' }}>Cor Clara?</Th>}
                {fields.includes('tipoMalha') && <Th>Tipo(s) Malha</Th>}
                {fields.includes('tecidos') && <Th>Tecido(s)</Th>}
                {fields.includes('personalizacoes') && <Th>Personalizações</Th>}
                <Th style={{ width: '180px' }}>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {(catalogItems[key] || []).map((item) => (
                <tr key={item._id}>
                  {fields.includes('imagem') && (
                    <Td>
                      {edit[key] === item._id ? (
                        <>
                           <FileInputLabel htmlFor={`edit-imagem-${key}-${item._id}`} style={{fontSize: '0.85rem', padding: '6px 10px'}}>
                             {form[key]?.preview || item.imagem ? 'Trocar' : 'Selecionar'}
                           </FileInputLabel>
                           <Input
                            type="file"
                            name="imagem"
                            id={`edit-imagem-${key}-${item._id}`}
                            accept="image/*"
                            onChange={(e) => handleEditChange(key, e)}
                            style={{ display: 'none' }}
                          />
                           {(form[key]?.preview || item.imagem) && 
                            <Img src={form[key]?.preview || getImagemUrl(item.imagem) || ''} alt="Preview" style={{marginLeft: '10px'}} />
                           }
                        </>
                      ) : (
                        item.imagem && <Img src={getImagemUrl(item.imagem)} alt={item.nome} />
                      )}
                    </Td>
                  )}
                  {fields.includes('nome') && (
                    <Td>
                      {edit[key] === item._id ? (
                        <Input
                          type="text"
                          name="nome"
                          value={form[key]?.nome || ''}
                          onChange={(e) => handleEditChange(key, e)}
                          required
                        />
                      ) : (
                        item.nome
                      )}
                    </Td>
                  )}
                  {fields.includes('valor') && (
                    <Td>
                      {edit[key] === item._id ? (
                        <Input
                          type="number"
                          step="0.01"
                          name="valor"
                          value={form[key]?.valor || ''}
                          onChange={(e) => handleEditChange(key, e)}
                          style={{maxWidth: '100px'}}
                        />
                      ) : (
                        formatBRL(item.valor)
                      )}
                    </Td>
                  )}
                  {fields.includes('rgb') && (
                    <Td>
                       {edit[key] === item._id ? (
                         <Input
                           type="color"
                           name="rgb"
                           value={form[key]?.rgb || '#ffffff'}
                           onChange={(e) => handleEditChange(key, e)}
                           style={{ padding: '4px', height: '40px'}}
                         />
                       ) : (
                         <div style={{ width: 24, height: 24, background: item.rgb, borderRadius: '4px', border: '1px solid #ccc' }} title={item.rgb}></div>
                       )}
                    </Td>
                  )}
                  {fields.includes('corClara') && (
                     <Td>
                       {edit[key] === item._id ? (
                         <input 
                           type="checkbox" 
                           name="corClara" 
                           checked={!!form[key]?.corClara}
                           onChange={(e) => handleEditChange(key, e)}
                         />
                       ) : (
                         item.corClara ? 'Sim' : 'Não'
                       )}
                     </Td>
                  )}
                   {fields.includes('tipoMalha') && (
                     <Td>
                       {edit[key] === item._id ? (
                           <select 
                                name="tipoMalha" 
                                value={Array.isArray(form[key]?.tipoMalha) ? form[key]?.tipoMalha : []}
                                onChange={(e) => handleEditChange(key, e)} 
                                multiple={key === 'cor'}
                                size={key === 'cor' ? 3 : undefined}
                                style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc', minWidth: '150px' }}
                           >
                               {key !== 'cor' && <option value="">Tipo Malha</option>} 
                               {tiposMalhaCatalog.map(tm => <option key={tm._id} value={tm.nome}>{tm.nome}</option>)}
                           </select>
                       ) : (
                          Array.isArray(item.tipoMalha) ? item.tipoMalha.join(', ') : item.tipoMalha
                       )}
                     </Td>
                   )}
                   {fields.includes('tecidos') && (
                      <Td>
                       {edit[key] === item._id ? (
                           <select 
                                name="tecidos" 
                                value={Array.isArray(form[key]?.tecidos) ? form[key]?.tecidos : []} 
                                onChange={(e) => handleEditChange(key, e)} 
                                multiple
                                size="3"
                                style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc', minWidth: '150px' }}
                           >
                               {tecidosOptions.map(t => <option key={t._id} value={t.nome}>{t.nome}</option>)}
                           </select>
                       ) : (
                          Array.isArray(item.tecidos) ? item.tecidos.join(', ') : ''
                       )}
                     </Td>
                   )}
                   {fields.includes('personalizacoes') && (
                      <Td>
                       {edit[key] === item._id ? (
                           <select 
                                name="personalizacoes" 
                                multiple
                                value={Array.isArray(form[key]?.personalizacoes) ? form[key]?.personalizacoes : []}
                                onChange={(e) => {
                                  const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                  handleEditChange(key, { target: { name: 'personalizacoes', value: options } });
                                }}
                                style={{ minWidth: '200px', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cfd8dc' }}
                           >
                               {personalizacaoOptions.map(p => <option key={p._id} value={p.nome}>{p.nome}</option>)}
                           </select>
                       ) : (
                          Array.isArray(item.personalizacoes) ? item.personalizacoes.join(', ') : ''
                       )}
                     </Td>
                   )}
                  <Td>
                    {edit[key] === item._id ? (
                      <ActionButtonsContainer>
                        <Button onClick={() => handleEditSave(key, item)} disabled={loading}>
                          {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <SecondaryButton onClick={() => handleEditCancel(key)} disabled={loading}>
                          Cancelar
                        </SecondaryButton>
                      </ActionButtonsContainer>
                    ) : (
                      <ActionButtonsContainer>
                        <Button onClick={() => handleEditClick(key, item)} disabled={loading}>Editar</Button>
                        <DangerButton onClick={() => handleDelete(key, item._id)} disabled={loading}>Excluir</DangerButton>
                      </ActionButtonsContainer>
                    )}
                  </Td>
                </tr>
              ))}
              {(catalogItems[key]?.length === 0) && (
                <tr>
                  <Td colSpan={fields.length + 2} style={{ textAlign: 'center', color: '#777' }}>Nenhum item neste grupo.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </SectionCard>
      ))}

      {Object.keys(catalogItems).length === 0 && !loading && (
         <p style={{textAlign: 'center', color: '#777', marginTop: '50px'}}>Nenhum grupo de catálogo encontrado ou erro ao carregar.</p>
      )}
      {loading && <p style={{textAlign: 'center', marginTop: '50px'}}>Carregando catálogo...</p> } 

    </Container>
  );
}
