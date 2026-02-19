import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Plus, Trash2, Send, Sparkles, Search } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:8006/api/v1';

// ============================================
// STYLED COMPONENTS
// ============================================
const PageWrapper = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 24px;
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  overflow: visible; 
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const FormSide = styled.div`
  padding: 40px;
  border-right: 1px solid #f1f5f9;
`;

const PreviewSide = styled.div`
  padding: 40px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 0 24px 24px 0;
  position: sticky;
  top: 20px;
  height: fit-content;
  @media (max-width: 900px) { border-radius: 0 0 24px 24px; position: static; }
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
  label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 8px;
  transition: 0.2s;
  &:focus { border-color: #BB0000; outline: none; box-shadow: 0 0 0 4px rgba(187,0,0,0.05); }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  &:focus { border-color: #BB0000; outline: none; }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-top: 8px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  &:hover { background: #fff1f1; color: #BB0000; }
  &:last-child { border-bottom: none; }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  background: #BB0000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  transition: 0.3s;
  &:hover:not(:disabled) { background: #990000; transform: translateY(-2px); }
  &:disabled { background: #cbd5e1; cursor: not-allowed; opacity: 0.7; }
`;

const TitleSection = styled.div`display: flex; align-items: center; gap: 10px; margin-bottom: 30px; h2 { margin: 0; font-size: 22px; }`;
const AgendaBox = styled.div`background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 15px;`;
const DeleteBtn = styled.button`background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 5px 0;`;
const AddBtn = styled.button`background: #f1f5f9; border: 1px dashed #cbd5e1; width: 100%; padding: 10px; border-radius: 10px; color: #475569; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;`;

// ============================================
// COMPONENT
// ============================================
const CreateManifesto = () => {
  const [leaders, setLeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    leader_id: '',
    leader_name: '',
    main_agenda: '',
    agenda_items: [{ title: '', description: '' }]
  });

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/leaders/leaders`);
        if (res.data.success) setLeaders(res.data.data);
      } catch (err) { console.error("Fetch failed", err); }
    };
    fetchLeaders();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLeader = (leader) => {
    setFormData(prev => ({ 
      ...prev, 
      leader_id: leader.id, 
      leader_name: leader.name 
    }));
    setSearchTerm(leader.name);
    setIsOpen(false);
  };

  const handleAgendaChange = (index, field, value) => {
    const updated = [...formData.agenda_items];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, agenda_items: updated }));
  };

  const isFormValid = 
    formData.leader_id && 
    formData.main_agenda.trim().length > 0 && 
    formData.agenda_items.some(item => item.title.trim() !== '' && item.description.trim() !== '');

  const handleSubmit = async () => {
    setLoading(true);
    const id = toast.loading("Publishing manifesto...");
    
    try {
      const payload = {
        leader_id: formData.leader_id,
        main_agenda: formData.main_agenda,
        agenda_items: formData.agenda_items.filter(item => item.title.trim() !== '')
      };

      const res = await axios.post(`${API_BASE_URL}/leaders/manifestos/create`, payload);
      
      if (res.data.success) {
        toast.update(id, { render: "Manifesto Published Successfully!", type: "success", isLoading: false, autoClose: 3000 });
        setFormData({ leader_id: '', leader_name: '', main_agenda: '', agenda_items: [{ title: '', description: '' }] });
        setSearchTerm('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to publish. Check your connection.";
      toast.update(id, { render: errorMsg, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ToastContainer position="top-right" theme="colored" />
      <GlassCard>
        <FormSide>
          <TitleSection>
             <Sparkles color="#BB0000" size={24}/>
             <h2>Create Official Manifesto</h2>
          </TitleSection>

          <InputGroup ref={dropdownRef}>
            <label>1. Target Leader</label>
            <div style={{position: 'relative'}}>
              <Search size={18} style={{position: 'absolute', left: '12px', top: '14px', color: '#94a3b8'}}/>
              <StyledInput 
                style={{paddingLeft: '40px'}}
                placeholder="Type name to find leader..."
                value={searchTerm}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
              />
            </div>
            {isOpen && (
              <DropdownMenu>
                {leaders
                  .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(l => (
                    <DropdownItem key={l.id} onClick={() => handleSelectLeader(l)}>
                      <strong>{l.name}</strong>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{l.party} - {l.position}</div>
                    </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </InputGroup>

          <InputGroup>
            <label>2. Core Vision Statement</label>
            <StyledInput 
              placeholder="The big primary goal..."
              value={formData.main_agenda}
              onChange={(e) => setFormData({...formData, main_agenda: e.target.value})}
            />
          </InputGroup>

          <InputGroup>
            <label>3. Detailed Agenda Points</label>
            {formData.agenda_items.map((item, i) => (
              <AgendaBox key={`agenda-item-${i}`}>
                <StyledInput 
                  placeholder="Point Title (e.g. Health)"
                  value={item.title}
                  onChange={(e) => handleAgendaChange(i, 'title', e.target.value)}
                />
                <StyledTextArea 
                  placeholder="Detailed description..."
                  value={item.description}
                  onChange={(e) => handleAgendaChange(i, 'description', e.target.value)}
                />
                {formData.agenda_items.length > 1 && (
                  <DeleteBtn onClick={() => setFormData({...formData, agenda_items: formData.agenda_items.filter((_, idx) => idx !== i)})}>
                    <Trash2 size={14}/> Remove Point
                  </DeleteBtn>
                )}
              </AgendaBox>
            ))}
            <AddBtn onClick={() => setFormData({...formData, agenda_items: [...formData.agenda_items, {title:'', description:''}]})}>
              <Plus size={16}/> Add New Point
            </AddBtn>
          </InputGroup>

          <ActionButton disabled={!isFormValid || loading} onClick={handleSubmit}>
            {loading ? 'Processing...' : <><Send size={18}/> Publish Manifesto</>}
          </ActionButton>
          
          {!isFormValid && !loading && (
            <p style={{fontSize: '11px', color: '#ef4444', marginTop: '10px', textAlign: 'center'}}>
              * Select a leader and fill at least one title & description.
            </p>
          )}
        </FormSide>

        <PreviewSide>
          <PreviewContent formData={formData} />
        </PreviewSide>
      </GlassCard>
    </PageWrapper>
  );
};

const PreviewContent = ({ formData }) => (
  <>
    <div style={{opacity: 0.5, fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px'}}>LIVE PREVIEW</div>
    <div style={{background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>
      <h2 style={{fontSize: '22px', margin: '0 0 5px 0'}}>{formData.leader_name || 'Select a Leader'}</h2>
      <div style={{width: '40px', height: '4px', background: '#BB0000', marginBottom: '20px'}}></div>
      <p style={{fontSize: '16px', fontWeight: '600', color: '#cbd5e1', fontStyle: 'italic'}}>
        "{formData.main_agenda || 'Your main vision...'}"
      </p>
      <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
        {formData.agenda_items.map((item, i) => (item.title) && (
          <div key={`preview-item-${i}`} style={{borderLeft: '2px solid #BB0000', paddingLeft: '15px'}}>
            <div style={{fontWeight: 'bold', fontSize: '14px'}}>{item.title}</div>
            <div style={{fontSize: '12px', color: '#94a3b8'}}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default CreateManifesto;