import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import ImageCropper from '../components/ProfileImageCropper';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(21, 97, 111, 0.09);
  padding: 2rem;
`;

const Title = styled.h1`
  color: #1a3c40;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProfileImageSection = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f0f0f0;
  overflow: hidden;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #1a3c40;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileDetails = styled.div`
  flex: 1;
  min-width: 300px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #1a3c40;
  }
`;

const ReadOnlyField = styled.div`
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #666;
`;

const Button = styled.button`
  background-color: #1a3c40;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #15616f;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const FileUploadButton = styled.label`
  display: inline-block;
  background-color: #15616f;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0d4e5b;
  }
  
  input {
    display: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e63946;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #2a9d8f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #e8f8f5;
  border-radius: 4px;
`;

export default function ProfilePage() {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // Inicializar com dados do usuário atual
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, [user]);
  
  // Lidar com mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar mensagens de erro/sucesso quando o usuário começa a editar
    setError('');
    setSuccess('');
  };
  
  // Lidar com seleção de imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar tipo e tamanho
      if (!file.type.match('image.*')) {
        setError('Por favor, selecione uma imagem válida (JPG, PNG, GIF).');
        return;
      }
      
      // Verificar se é JPEG, PNG ou GIF explicitamente
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!acceptedTypes.includes(file.type)) {
        setError(`Formato de imagem não suportado. Use JPEG, PNG ou GIF.`);
        return;
      }
      
      // Verificar tamanho (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`A imagem deve ser menor que 2MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      // Criar preview para o cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setShowCropper(true);
      };
      reader.onerror = () => {
        setError('Erro ao processar a imagem. Tente novamente.');
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };
  
  // Lidar com a finalização do recorte
  const handleCropComplete = (croppedFile, previewUrl) => {
    setProfileImage(croppedFile);
    setImagePreview(previewUrl);
    setShowCropper(false);
    setOriginalImage(null);
  };
  
  // Cancelar o recorte de imagem
  const handleCancelCrop = () => {
    setShowCropper(false);
    setOriginalImage(null);
  };
  
  // Verificar se as senhas coincidem
  const passwordsMatch = () => {
    return !formData.newPassword || formData.newPassword === formData.confirmNewPassword;
  };
  
  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (formData.newPassword && !passwordsMatch()) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (formData.newPassword && !formData.currentPassword) {
      setError('Informe sua senha atual para definir uma nova senha.');
      return;
    }
    
    // Verificar força da senha se estiver sendo alterada
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Criar FormData para upload de imagem
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      if (formData.currentPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
      }
      
      if (formData.newPassword) {
        formDataToSend.append('newPassword', formData.newPassword);
      }
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      
      // Enviar para API com feedback de progresso
      console.log('Enviando atualização de perfil...');
      const response = await updateUserProfile(formDataToSend);
      
      // Atualizar dados no contexto de autenticação
      if (response && response.user) {
        updateUserInfo(response.user);
        console.log('Dados do usuário atualizados no contexto');
      }
      
      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
      // Reiniciar estado da imagem se foi enviada com sucesso
      if (profileImage) {
        setProfileImage(null);
        // Manter o preview para que o usuário veja a imagem atualizada
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil. Tente novamente.');
      
      // Análise específica de erro para dar feedback mais preciso
      const errorMessage = err.message?.toLowerCase() || '';
      if (errorMessage.includes('senha')) {
        setError('Senha atual incorreta. Verifique e tente novamente.');
      } else if (errorMessage.includes('imagem') || errorMessage.includes('arquivo')) {
        setError('Erro ao enviar imagem. Verifique o formato e tamanho.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Title>Meu Perfil</Title>
      
      {showCropper && originalImage ? (
        <div>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Ajuste sua foto de perfil</h3>
          <ImageCropper 
            src={originalImage} 
            onCropComplete={handleCropComplete} 
            onCancel={handleCancelCrop} 
          />
        </div>
      ) : (
        <ProfileSection>
          <ProfileImageSection>
            <ProfileImage>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <span style={{ fontSize: '2rem' }}>👤</span>
              )}
            </ProfileImage>
            
            <FileUploadButton>
              Alterar Foto
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </FileUploadButton>
          </ProfileImageSection>
          
          <ProfileDetails>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>E-mail</Label>
                <ReadOnlyField>{user?.email || ''}</ReadOnlyField>
              </FormGroup>
              
              <FormGroup>
                <Label>Loja</Label>
                <ReadOnlyField>{user?.loja || 'Nenhuma loja atribuída'}</ReadOnlyField>
              </FormGroup>
              
              <FormGroup>
                <Label>Função</Label>
                <ReadOnlyField>
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'vendedor' ? 'Vendedor' : 
                   user?.role === 'producao' ? 'Produção' : 'Não definida'}
                </ReadOnlyField>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="name">Nome</Label>
                <Input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input 
                  type="password" 
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Necessária para alterar a senha"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input 
                  type="password" 
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                <Input 
                  type="password" 
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="Confirme a nova senha"
                  style={formData.newPassword && !passwordsMatch() ? { borderColor: '#e63946' } : {}}
                />
                {formData.newPassword && !passwordsMatch() && (
                  <ErrorMessage>As senhas não coincidem</ErrorMessage>
                )}
              </FormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}
              
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Form>
          </ProfileDetails>
        </ProfileSection>
      )}
    </Container>
  );
} 