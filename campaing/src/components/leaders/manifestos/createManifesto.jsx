import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Trash2, Send, Loader2, Edit3, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../api/api";

// --- Styled Components ---
const Container = styled.div`
  background: white;
  padding:   10px  0px;
  border: 1px solid #e2e8f0;
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  border-right: 1px solid #e2e8f0;
`;

const PreviewSection = styled.div`
  background: #0f172a;
  color: white;
`;

const InputWrapper = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b; /* dark text for visibility */
  background: white;
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    border-color: #1e3c72;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  min-height: 70px;
  margin-top: 6px;
  color: #1e293b; /* dark text for visibility */
  background: white;
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    border-color: #1e3c72;
    outline: none;
  }
`;

const AgendaCard = styled.div`
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  background: #1e3c72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #2a5298;
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const DeleteBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ef4444;
  font-weight: 700;
  cursor: pointer;
  background: white;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #ef4444;
    color: white;
  }
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  
  button {
    flex: 1;
    padding: 8px;
    border: 1.5px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #1e293b;
    
    &.active {
      background: #1e3c72;
      color: white;
      border-color: #1e3c72;
    }
  }
`;

const AddPillarBtn = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 2px dashed #cbd5e1;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background: #f8fafc;
    border-color: #1e3c72;
  }
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  
  .spinner {
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const CreateManifesto = ({ leaderId, onManifestoChange }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [manifestoId, setManifestoId] = useState(null);
  const [mode, setMode] = useState("edit");

  const activeLeaderId = leaderId || localStorage.getItem("currentLeaderId");

  const [formData, setFormData] = useState({
    leader_id: activeLeaderId || "",
    main_agenda: "",
    agenda_items: [{ title: "", description: "" }],
  });

  useEffect(() => {
    const fetchExistingManifesto = async () => {
      if (!activeLeaderId) {
        setInitialLoading(false);
        return;
      }

      try {
        const res = await api.get(`/leaders/manifestos/leader/${activeLeaderId}`);
        const existing = Array.isArray(res.data) ? res.data[0] : res.data?.data?.[0];

        if (existing) {
          setManifestoId(existing.manifesto_id);
          setFormData({
            leader_id: activeLeaderId,
            main_agenda: existing.main_agenda || "",
            agenda_items: existing.agenda_items?.length > 0
              ? existing.agenda_items
              : [{ title: "", description: "" }],
          });
        }
      } catch (err) {
        console.log("No existing manifesto found");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchExistingManifesto();
  }, [activeLeaderId]);

  const handleAgendaChange = (index, field, value) => {
    const updated = [...formData.agenda_items];
    updated[index][field] = value;
    setFormData({ ...formData, agenda_items: updated });
  };

  const addPoint = () => {
    setFormData({
      ...formData,
      agenda_items: [...formData.agenda_items, { title: "", description: "" }],
    });
  };

  const removePoint = (index) => {
    const filtered = formData.agenda_items.filter((_, i) => i !== index);
    setFormData({ ...formData, agenda_items: filtered });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leader_id) {
      toast.error("Leader ID missing");
      return;
    }

    if (!formData.main_agenda) {
      toast.error("Please enter your vision statement");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(manifestoId ? "Updating..." : "Publishing...");

    try {
      const cleanedItems = formData.agenda_items.filter((item) => item.title.trim() !== "");

      const payload = {
        leader_id: formData.leader_id,
        main_agenda: formData.main_agenda,
        agenda_items: cleanedItems.length > 0
          ? cleanedItems
          : [{ title: "General Agenda", description: formData.main_agenda }],
      };

      let response;
      if (manifestoId) {
        response = await api.put(`/leaders/manifestos/${manifestoId}`, payload);
      } else {
        response = await api.post(`/leaders/manifestos/create`, payload);
        if (response.success && response.data?.manifesto_id) {
          setManifestoId(response.data.manifesto_id);
        }
      }

      toast.update(toastId, {
        render: response.data.message || (manifestoId ? "Updated!" : "Created!"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      if (onManifestoChange) onManifestoChange(response.data.data);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to save",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!manifestoId) {
      toast.error("No manifesto found");
      return;
    }

    if (!window.confirm("Delete manifesto? This cannot be undone.")) return;

    setLoading(true);
    const toastId = toast.loading("Deleting...");

    try {
      await api.delete(`/leaders/manifestos/${manifestoId}`);

      toast.update(toastId, {
        render: "Deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setManifestoId(null);
      setFormData({
        leader_id: activeLeaderId,
        main_agenda: "",
        agenda_items: [{ title: "", description: "" }],
      });

      if (onManifestoChange) onManifestoChange(null);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <LoadingSpinner>
        <Loader2 className="spinner" size={32} color="#1e3c72" />
      </LoadingSpinner>
    );
  }

  return (
    <Container>
      {manifestoId && (
        <ModeToggle>
          <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>
            <Edit3 size={14} /> Edit
          </button>
          <button className={mode === "delete" ? "active" : ""} onClick={() => setMode("delete")}>
            <Trash2 size={14} /> Delete
          </button>
        </ModeToggle>
      )}

      {mode === "delete" && manifestoId ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <XCircle size={60} color="#ef4444" />
          <h3 style={{ color: "#ef4444", margin: "15px 0 10px" }}>Delete Manifesto?</h3>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            This will permanently remove all agenda items and votes.
          </p>
          <DeleteBtn onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="spinner" size={16} /> : <Trash2 size={16} />}
            {loading ? "Deleting..." : "Permanently Delete"}
          </DeleteBtn>
        </div>
      ) : (
        <TwoColumn>
          <FormSection style={{ padding: "10px" }}>
            <form onSubmit={handleSubmit}>
              <InputWrapper>
                <label>Vision Statement</label>
                <Input
                  placeholder="e.g. A digital-first economy for all Kenyans"
                  value={formData.main_agenda}
                  onChange={(e) => setFormData({ ...formData, main_agenda: e.target.value })}
                  required
                />
              </InputWrapper>

              <InputWrapper>
                <label>Manifesto Pillars</label>
                {formData.agenda_items.map((item, i) => (
                  <AgendaCard key={i}>
                    <Input
                      placeholder="Pillar Title"
                      value={item.title}
                      onChange={(e) => handleAgendaChange(i, "title", e.target.value)}
                    />
                    <TextArea
                      placeholder="Describe your plan..."
                      value={item.description}
                      onChange={(e) => handleAgendaChange(i, "description", e.target.value)}
                    />
                    {formData.agenda_items.length > 1 && (
                      <RemoveBtn type="button" onClick={() => removePoint(i)}>
                        <Trash2 size={12} /> Remove
                      </RemoveBtn>
                    )}
                  </AgendaCard>
                ))}
              </InputWrapper>

              <AddPillarBtn type="button" onClick={addPoint}>
                <Plus size={16} /> Add Pillar
              </AddPillarBtn>

              <Button disabled={loading}>
                {loading ? <Loader2 className="spinner" size={16} /> : <Send size={16} />}
                {manifestoId ? "Update" : "Publish"}
              </Button>
            </form>
          </FormSection>

          <PreviewSection style={{ padding: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "20px", opacity: 0.5 }}>
              LIVE PREVIEW
            </div>

            <div style={{ borderLeft: "3px solid #3b82f6", paddingLeft: "15px", marginBottom: "30px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>The Vision</h3>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                "{formData.main_agenda || "Your vision will appear here..."}"
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "11px", color: "#3b82f6", marginBottom: "15px" }}>
                STRATEGIC PILLARS
              </h4>
              {formData.agenda_items.map((item, i) => item.title && (
                <div key={i} style={{ marginBottom: "12px", padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>{item.title}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{item.description}</div>
                </div>
              ))}
            </div>
          </PreviewSection>
        </TwoColumn>
      )}
    </Container>
  );
};

export default CreateManifesto;