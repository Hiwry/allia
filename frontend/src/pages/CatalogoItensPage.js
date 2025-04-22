import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';
import { getCatalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, reorderCatalogItems, uploadImage } from '../services/catalogApi';

const Container = styled.main`
  margin: 0 auto;
  max-width: 900px;
  padding: 48px 32px 32px 32px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #15616f;
  margin-bottom: 32px;
`;

const Section = styled.section`
  margin-bottom: 42px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #22344a;
  margin-bottom: 18px;
`;

const Table = styled.table`
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
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.18s;
  &:hover { background: #22344a; }
`;

const Input = styled.input`
  border: 1px solid #cfd8dc;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 1rem;
  outline: none;
  min-width: 80px;
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

function CatalogoItensPageContent({ minimalista }) {
  const [catalogItems, setCatalogItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState({}); // { grupo: id }
  const [form, setForm] = useState({}); // { grupo: { ...campos } }
  const [addForm, setAddForm] = useState({}); // { grupo: { ...campos } }
  const [catalogErrors, setCatalogErrors] = useState({}); // { grupo: mensagem }

  useEffect(() => {
    document.body.style.background = minimalista ? '#f7fafc' : '#fff';
    document.body.style.color = '#15616f';
  }, [minimalista]);

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
    // Se o grupo aceita imagem e há uma imagem selecionada, faz upload
    if ((grupo === 'gola' || grupo === 'detalhe') && item.imagem && item.imagem instanceof File) {
      try {
        imagemUrl = await uploadImage(item.imagem);
      } catch {
        setCatalogErrors(errs => ({ ...errs, [grupo]: 'Erro ao fazer upload da imagem.' }));
        setLoading(false);
        return;
      }
    }
    // CORREÇÃO: Converter valor para número (com ponto)
    if (typeof item.valor === 'string') {
      item.valor = parseFloat(item.valor.replace(',', '.'));
    }
    // CORREÇÃO: Garantir tipoMalha é array
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

  // Função utilitária para formatar valor em real brasileiro
  function formatBRL(valor) {
    if (valor === undefined || valor === null || valor === '') return '';
    const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    if (isNaN(num)) return valor;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const tiposMalhaCatalog = catalogItems['tipoMalha'] || [];

  function renderGrupoContent({ key, label, fields, catalogItems, edit, form, addForm, handleAddChange, handleAddSave, handleEditChange, handleEditSave, handleEditCancel, handleDelete, catalogErrors, formatBRL, tiposMalhaCatalog, Input, Img, Button, Table, Th, Td }) {
    if (key === 'personalizacao') {
      return (
        <>
          {catalogErrors[key] && (
            <div style={{
              color: '#d32f2f',
              background: '#ffeaea',
              border: '1px solid #d32f2f',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 12,
              textAlign: 'center',
            }}>{catalogErrors[key]}</div>
          )}
          <form onSubmit={e => handleAddSave(key, e)} style={{ display: 'flex', gap: 14, marginBottom: 18, justifyContent: 'center', alignItems: 'center' }}>
            <Input
              name="nome"
              placeholder="Digite o tipo de personalização"
              value={addForm[key]?.nome || ''}
              onChange={e => handleAddChange(key, e)}
              required
              style={{ minWidth: 220, fontSize: '1rem', borderRadius: 6 }}
            />
            <Button type="submit">Adicionar</Button>
          </form>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {(catalogItems[key] || []).map((item) => (
                <tr key={item._id}>
                  <Td>{edit[key] === item._id ? (
                    <Input
                      name="nome"
                      value={form[key]?.nome || ''}
                      onChange={e => handleEditChange(key, e)}
                      style={{ marginRight: 10, minWidth: 120 }}
                      required
                    />
                  ) : (
                    item.nome
                  )}</Td>
                  <Td>
                    {edit[key] === item._id ? (
                      <>
                        <Button type="button" onClick={() => handleEditSave(key, item)}>Salvar</Button>
                        <Button type="button" onClick={() => handleEditCancel(key)} style={{ background: '#b0bec5', color: '#22344a' }}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" onClick={() => handleEditClick(key, item)}>Editar</Button>
                        <Button type="button" onClick={() => handleDelete(key, item._id)} style={{ background: '#d32f2f' }}>Excluir</Button>
                      </>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      );
    }
    // ...restante igual para outros grupos...
    return (
      <>
        {catalogErrors[key] && (
          <div style={{
            color: '#d32f2f',
            background: '#ffeaea',
            border: '1px solid #d32f2f',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 12,
            textAlign: 'center',
          }}>{catalogErrors[key]}</div>
        )}

        {/* Formulário de adição customizado para CORES */}
        {key === 'cor' ? (
          <form onSubmit={e => handleAddSave(key, e)} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 18, justifyContent: 'center', alignItems: 'center' }}>
            <Input name="nome" placeholder="Nome" value={addForm[key]?.nome || ''} onChange={e => handleAddChange(key, e)} required />
            <input
              name="rgb"
              type="color"
              value={addForm[key]?.rgb || '#ffffff'}
              onChange={e => handleAddChange(key, e)}
              style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}
              required
            />
            <select
              multiple
              name="tipoMalha"
              value={addForm[key]?.tipoMalha || []}
              onChange={e => {
                const options = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                handleAddChange(key, { target: { name: 'tipoMalha', value: options } });
              }}
              style={{ minWidth: 120, padding: '6px 10px', borderRadius: 6, fontSize: '1rem' }}
              required
            >
              {(catalogItems['tipoMalha'] || []).map(tm => (
                <option value={tm.nome} key={tm._id}>{tm.nome}</option>
              ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                name="corClara"
                checked={!!addForm.cor?.corClara}
                onChange={e => handleAddChange(key, { target: { name: 'corClara', value: e.target.checked } })}
                style={{ marginRight: 4 }}
              />
              Cor clara
            </label>
            <Button type="submit">Adicionar</Button>
          </form>
        ) : (
          <form onSubmit={e => handleAddSave(key, e)} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 18, justifyContent: 'center' }}>
            {fields.map((field) => (
              key === 'personalizacao' && field === 'nome' ? (
                <Input
                  key={field}
                  name={field}
                  placeholder="Digite o tipo de personalização"
                  value={addForm[key] && addForm[key][field]}
                  onChange={e => handleAddChange(key, e)}
                  required
                />
              ) : key === 'tecido' && field === 'nome' ? (
                <>
                  <Input key={field} name={field} placeholder={field} value={addForm[key] && addForm[key][field]} onChange={e => handleAddChange(key, e)} required={field === 'nome'} />
                  <select
                    multiple
                    name="personalizacoes"
                    value={addForm[key] && addForm[key].personalizacoes ? addForm[key].personalizacoes : []}
                    onChange={e => {
                      const options = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                      handleAddChange(key, { target: { name: 'personalizacoes', value: options } });
                    }}
                    style={{ minWidth: 160, padding: '6px 10px', borderRadius: 6, fontSize: '1rem' }}
                  >
                    <option value="Serigrafia">Serigrafia</option>
                    <option value="Sublimação Local">Sublimação Local</option>
                    <option value="Sublimação Total">Sublimação Total</option>
                    <option value="DTF">DTF</option>
                    <option value="Bordado">Bordado</option>
                    <option value="Emborrachado">Emborrachado</option>
                    <option value="Lisas">Lisas</option>
                  </select>
                </>
              ) : key === 'tipoMalha' && field === 'nome' ? (
                <Input key={field} name={field} placeholder={field} value={addForm[key] && addForm[key][field]} onChange={e => handleAddChange(key, e)} required={field === 'nome'} />
              ) : key === 'tipoMalha' && field === 'tecidos' ? (
                <select
                  multiple
                  name="tecidos"
                  value={addForm[key] && addForm[key].tecidos ? addForm[key].tecidos : []}
                  onChange={e => {
                    const options = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                    handleAddChange(key, { target: { name: 'tecidos', value: options } });
                  }}
                  style={{ minWidth: 160, padding: '6px 10px', borderRadius: 6, fontSize: '1rem' }}
                >
                  {(catalogItems['tecido'] || []).map(t => (
                    <option value={t.nome} key={t._id}>{t.nome}</option>
                  ))}
                </select>
              ) : key === 'corte' && field === 'tipoMalha' ? (
                <select
                  multiple
                  name="tipoMalha"
                  value={addForm[key] && addForm[key].tipoMalha ? addForm[key].tipoMalha : []}
                  onChange={e => {
                    const options = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                    handleAddChange(key, { target: { name: 'tipoMalha', value: options } });
                  }}
                  style={{ minWidth: 120, padding: '6px 10px', borderRadius: 6, fontSize: '1rem' }}
                >
                  {tiposMalhaCatalog.map(tm => (
                    <option key={tm.nome} value={tm.nome}>{tm.nome}</option>
                  ))}
                </select>
              ) : field === 'imagem' && (key === 'gola' || key === 'detalhe') ? (
                <Input key={field} name={field} type="file" accept="image/*" onChange={e => handleAddChange(key, e)} required={false} />
              ) : (
                <Input key={field} name={field} placeholder={field} value={addForm[key] && addForm[key][field]} onChange={e => handleAddChange(key, e)} required={field === 'nome'} />
              )
            ))}
            {addForm[key] && addForm[key].imagem && <Img src={addForm[key].preview} alt="Prévia" />}
            <Button type="submit">Adicionar</Button>
          </form>
        )}

        {/* Tabela de visualização customizada para CORES */}
        {key === 'cor' ? (
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Cor</Th>
                <Th>Tipo de Tecido</Th>
                <Th>Cor Clara</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {(catalogItems[key] || []).map((item) => (
                <tr key={item._id}>
                  <Td>{edit[key] === item._id ? (
                    <Input
                      name="nome"
                      value={form[key]?.nome || ''}
                      onChange={e => handleEditChange(key, e)}
                      style={{ marginRight: 10, minWidth: 100 }}
                      required
                    />
                  ) : (
                    item.nome
                  )}</Td>
                  <Td>
                    {edit[key] === item._id ? (
                      <input
                        name="rgb"
                        type="color"
                        value={form[key]?.rgb || '#ffffff'}
                        onChange={e => handleEditChange(key, e)}
                        style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }}
                        required
                      />
                    ) : (
                      <span style={{ display: 'inline-block', width: 30, height: 30, background: item.rgb || '#fff', border: '1px solid #ccc', borderRadius: 6, verticalAlign: 'middle' }} title={item.rgb}></span>
                    )}
                  </Td>
                  <Td>
                    {Array.isArray(item.tipoMalha) && item.tipoMalha.length > 0
                      ? item.tipoMalha.join(', ')
                      : <span style={{ color: '#888' }}>Nenhum</span>}
                  </Td>
                  <Td>
                    {edit[key] === item._id ? (
                      <label style={{ display: 'block', marginTop: 8 }}>
                        <input
                          type="checkbox"
                          name="corClara"
                          checked={!!form.cor?.corClara}
                          onChange={e => handleEditChange(key, { target: { name: 'corClara', value: e.target.checked } })}
                          style={{ marginRight: 6 }}
                        />
                        Cor clara
                      </label>
                    ) : (
                      item.corClara ? 'Sim' : 'Não'
                    )}
                  </Td>
                  <Td>
                    {edit[key] === item._id ? (
                      <>
                        <Button type="button" onClick={() => handleEditSave(key, item)}>Salvar</Button>
                        <Button type="button" onClick={() => handleEditCancel(key)} style={{ background: '#b0bec5', color: '#22344a' }}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" onClick={() => handleEditClick(key, item)}>Editar</Button>
                        <Button type="button" onClick={() => handleDelete(key, item._id)} style={{ background: '#d32f2f' }}>Excluir</Button>
                      </>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Table>
            <thead>
              <tr>
                {key === 'tipoMalha' ? (<><Th>Nome</Th><Th>Tecidos</Th></>) : <Th>Nome</Th>}
                {key === 'corte' && <><Th>Tipo de Tecido</Th><Th>Valor</Th></>}
                {key !== 'tecido' && key !== 'corte' && fields.filter(f => f !== 'nome' && f !== 'personalizacoes' && f !== 'tecidos' && f !== 'rgb' && f !== 'tipoMalha' && f !== 'corClara').map((field) => (
                  field === 'imagem' ? (
                    <Th key={field}>Imagem</Th>
                  ) : field === 'valor' ? (
                    <Th key={field}>Valor</Th>
                  ) : (
                    <Th key={field}>{field}</Th>
                  )
                ))}
                {key !== 'corte' && <Th>Ações</Th>}
              </tr>
            </thead>
            <tbody>
              {(catalogItems[key] || []).map((item) => (
                <tr key={item._id}>
                  {key === 'tipoMalha'
                    ? (<>
                        <Td>{edit[key] === item._id ? (
                          <Input
                            name="nome"
                            value={form[key]?.nome || ''}
                            onChange={e => handleEditChange(key, e)}
                            style={{ marginRight: 10, minWidth: 100 }}
                            required
                          />
                        ) : (
                          item.nome
                        )}</Td>
                        <Td>{edit[key] === item._id ? (
                          <select
                            multiple
                            name="tecidos"
                            value={form[key]?.tecidos || []}
                            onChange={e => {
                              const options = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                              handleEditChange(key, { target: { name: 'tecidos', value: options } });
                            }}
                            style={{ minWidth: 160, padding: '6px 10px', borderRadius: 6, fontSize: '1rem' }}
                          >
                            {(catalogItems['tecido'] || []).map(t => (
                              <option value={t.nome} key={t._id}>{t.nome}</option>
                            ))}
                          </select>
                        ) : (
                          (item.tecidos || []).join(', ')
                        )}</Td>
                      </>)
                    : key === 'corte'
                      ? (<>
                          <Td>{edit[key] === item._id ? (
                            <Input
                              name="nome"
                              value={form[key]?.nome || ''}
                              onChange={e => handleEditChange(key, e)}
                              style={{ marginRight: 10, minWidth: 100 }}
                              required
                            />
                          ) : (
                            item.nome
                          )}</Td>
                          <Td>{edit[key] === item._id ? (
                            <select
                              name="tipoMalha"
                              multiple
                              value={form[key]?.tipoMalha || []}
                              onChange={e => {
                                const options = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                                handleEditChange(key, { target: { name: 'tipoMalha', value: options } });
                              }}
                              style={{ minWidth: 120 }}
                            >
                              {tiposMalhaCatalog.map(tm => (
                                <option key={tm.nome} value={tm.nome}>{tm.nome}</option>
                              ))}
                            </select>
                          ) : (
                            Array.isArray(item.tipoMalha) && item.tipoMalha.length > 0
                              ? item.tipoMalha.join(', ')
                              : <span style={{ color: '#888' }}>Nenhum</span>
                          )}</Td>
                          <Td>{edit[key] === item._id ? (
                            <Input
                              name="valor"
                              type="number"
                              value={form[key]?.valor || ''}
                              onChange={e => handleEditChange(key, e)}
                              style={{ minWidth: 80 }}
                              required
                            />
                          ) : (
                            formatBRL(item.valor)
                          )}</Td>
                          <Td>{edit[key] === item._id ? (
                            <>
                              <Button type="button" onClick={() => handleEditSave(key, item)}>Salvar</Button>
                              <Button type="button" onClick={() => handleEditCancel(key)} style={{ background: '#b0bec5', color: '#22344a' }}>Cancelar</Button>
                            </>
                          ) : (
                            <>
                              <Button type="button" onClick={() => handleEditClick(key, item)}>Editar</Button>
                              <Button type="button" onClick={() => handleDelete(key, item._id)} style={{ background: '#d32f2f' }}>Excluir</Button>
                            </>
                          )}</Td>
                        </>)
                      : (<Td>{edit[key] === item._id ? (
                          <Input
                            name="nome"
                            value={form[key]?.nome || ''}
                            onChange={e => handleEditChange(key, e)}
                            style={{ marginRight: 10, minWidth: 100 }}
                            required
                          />
                        ) : (
                          item.nome
                        )}</Td>)}
                  {key !== 'tecido' && key !== 'corte' && fields.filter(f => f !== 'nome' && f !== 'personalizacoes' && f !== 'tecidos' && f !== 'rgb' && f !== 'tipoMalha' && f !== 'corClara').map((field) => (
                    field === 'imagem' ? (
                      <Td key={field}>
                        {item.imagem ? (
                          <Img src={item.imagem.startsWith('/') ? item.imagem : `/uploads/${item.imagem}`} alt={item.nome} />
                        ) : ''}
                      </Td>
                    ) : field === 'valor' ? (
                      <Td key={field}>{formatBRL(item[field])}</Td>
                    ) : (
                      <Td key={field}>{item[field]}</Td>
                    )
                  ))}
                  {key !== 'corte' && (
                    <Td>
                      {edit[key] === item._id ? (
                        <>
                          <Button type="button" onClick={() => handleEditSave(key, item)}>Salvar</Button>
                          <Button type="button" onClick={() => handleEditCancel(key)} style={{ background: '#b0bec5', color: '#22344a' }}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" onClick={() => handleEditClick(key, item)}>Editar</Button>
                          <Button type="button" onClick={() => handleDelete(key, item._id)} style={{ background: '#d32f2f' }}>Excluir</Button>
                        </>
                      )}
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </>
    );
  }

  return (
    <Container style={minimalista ? { maxWidth: 1200, padding: '32px 0', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' } : {}}>
      <Title style={minimalista ? { fontSize: '1.7rem', color: '#22344a', margin: '0 0 28px 0', fontWeight: 700, letterSpacing: 0.5, textAlign: 'center' } : {}}>Catálogo de Itens</Title>
      {minimalista ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, width: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* Coluna esquerda: Costura */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, minWidth: 350, maxWidth: 520, margin: '0 auto' }}>
            {grupos.filter(g => ['gola','detalhe','tecido','corte','tipoMalha'].includes(g.key)).map(({ key, label, fields }) => (
              <Section
                key={key}
                style={minimalista ? {
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 2px 16px rgba(23,42,58,0.07)',
                  padding: '30px 22px',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                  minWidth: 320,
                  maxWidth: 520,
                  margin: '0 auto',
                } : {}}
              >
                <SectionTitle style={minimalista ? { fontSize: '1.13rem', color: '#15616f', marginBottom: 12, letterSpacing: 0.2, textAlign: 'center', textTransform: 'uppercase', fontWeight: 700 } : {}}>{label}</SectionTitle>
                {renderGrupoContent({ key, label, fields, catalogItems, edit, form, addForm, handleAddChange, handleAddSave, handleEditChange, handleEditSave, handleEditCancel, handleDelete, catalogErrors, formatBRL, tiposMalhaCatalog, Input, Img, Button, Table, Th, Td })}
              </Section>
            ))}
          </div>
          {/* Coluna direita: Cores e Personalização */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, minWidth: 350, maxWidth: 520, margin: '0 auto' }}>
            {grupos.filter(g => ['cor','personalizacao'].includes(g.key)).map(({ key, label, fields }) => (
              <Section
                key={key}
                style={minimalista ? {
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 2px 16px rgba(23,42,58,0.07)',
                  padding: '30px 22px',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                  minWidth: 320,
                  maxWidth: 520,
                  margin: '0 auto',
                } : {}}
              >
                <SectionTitle style={minimalista ? { fontSize: '1.13rem', color: '#15616f', marginBottom: 12, letterSpacing: 0.2, textAlign: 'center', textTransform: 'uppercase', fontWeight: 700 } : {}}>{label}</SectionTitle>
                {renderGrupoContent({ key, label, fields, catalogItems, edit, form, addForm, handleAddChange, handleAddSave, handleEditChange, handleEditSave, handleEditCancel, handleDelete, catalogErrors, formatBRL, tiposMalhaCatalog, Input, Img, Button, Table, Th, Td })}
              </Section>
            ))}
          </div>
        </div>
      ) : (
        // Layout antigo
        grupos.map(({ key, label, fields }) => (
          <Section key={key}>
            <SectionTitle>{label}</SectionTitle>
            {renderGrupoContent({ key, label, fields, catalogItems, edit, form, addForm, handleAddChange, handleAddSave, handleEditChange, handleEditSave, handleEditCancel, handleDelete, catalogErrors, formatBRL, tiposMalhaCatalog, Input, Img, Button, Table, Th, Td })}
          </Section>
        ))
      )}
    </Container>
  );
}

export default function CatalogoItensPage({ minimalista }) {
  // Garante que a sidebar sempre aparece
  return (
    <Layout>
      <CatalogoItensPageContent minimalista={minimalista} />
    </Layout>
  );
}
