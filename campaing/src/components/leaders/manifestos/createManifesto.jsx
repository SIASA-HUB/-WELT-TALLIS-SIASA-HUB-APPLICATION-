import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Plus,
  Trash2,
  Send,
  FileText,
  Sparkles,
  Loader2,
  Edit3,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "./apiConfig";

// --- Styled Components ---

const GlassCard = styled.div`
  background: white;
  border-radius: 20px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FormSide = styled.div`
  padding: 25px;
  @media (min-width: 768px) {
    padding: 40px;
  }
  border-right: 1px solid #f1f5f9;
`;

const PreviewSide = styled.div`
  padding: 30px;
  background: #0f172a;
  color: white;
  @media (max-width: 992px) {
    min-height: 300px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  label {
    display: block;
    font-size: 12px;
    font-weight: 800;
    color: #475569;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  &:focus {
    border-color: #1e3c72;
    outline: none;
    background: #f8fafc;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  min-height: 80px;
  margin-top: 8px;
  &:focus {
    border-color: #1e3c72;
    outline: none;
  }
`;

const AgendaBox = styled.div`
  background: #f8fafc;
  padding: 20px;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  margin-bottom: 15px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  background: #1e3c72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;
  &:hover:not(:disabled) {
    background: #2a5298;
    transform: translateY(-2px);
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #ef4444;
  font-weight: 800;
  cursor: pointer;
  background: white;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;
  margin-top: 15px;
  &:hover:not(:disabled) {
    background: #ef4444;
    color: white;
    transform: translateY(-2px);
  }
  &:disabled {
    background: #fecaca;
    cursor: not-allowed;
  }
`;

const ModeSwitch = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  button {
    flex: 1;
    padding: 10px;
    border: 2px solid #e2e8f0;
    background: white;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    &.active {
      background: #1e3c72;
      color: white;
      border-color: #1e3c72;
    }
  }
`;

const CreateManifesto = ({ leaderId, onManifestoChange }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [manifestoId, setManifestoId] = useState(null);
  const [mode, setMode] = useState("edit"); // 'edit' or 'delete'

  const activeLeaderId = leaderId || localStorage.getItem("currentLeaderId");

  const [formData, setFormData] = useState({
    leader_id: activeLeaderId || "",
    main_agenda: "",
    agenda_items: [{ title: "", description: "" }],
  });

  // Fetch existing manifesto
  useEffect(() => {
    const fetchExistingManifesto = async () => {
      if (!activeLeaderId) {
        setInitialLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/manifestos/leader/${activeLeaderId}`,
        );
        const existing = Array.isArray(res.data)
          ? res.data[0]
          : res.data.data?.[0];

        if (existing) {
          setManifestoId(existing.manifesto_id);
          setFormData({
            leader_id: activeLeaderId,
            main_agenda: existing.main_agenda || "",
            agenda_items: existing.agenda_items || [
              { title: "", description: "" },
            ],
          });
        }
      } catch (err) {
        console.log("No existing manifesto found.");
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

    if (!formData.leader_id || !formData.main_agenda) {
      toast.error("Please ensure your vision statement is filled out.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      manifestoId ? "Updating your manifesto..." : "Publishing manifesto...",
    );

    try {
      const cleanedItems = formData.agenda_items.filter(
        (item) => item.title.trim() !== "",
      );

      const payload = {
        leader_id: formData.leader_id,
        main_agenda: formData.main_agenda,
        agenda_items:
          cleanedItems.length > 0
            ? cleanedItems
            : [{ title: "General Agenda", description: formData.main_agenda }],
      };

      let response;
      if (manifestoId) {
        response = await axios.put(
          `${API_BASE_URL}/manifestos/${manifestoId}`,
          payload,
        );
        toast.update(toastId, {
          render: response.data.message || "Manifesto updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        response = await axios.post(
          `${API_BASE_URL}/manifestos/create`,
          payload,
        );
        if (response.data.success && response.data.data?.manifesto_id) {
          setManifestoId(response.data.data.manifesto_id);
        }
        toast.update(toastId, {
          render: response.data.message || "Manifesto created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      if (onManifestoChange) {
        onManifestoChange(response.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save manifesto";
      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!manifestoId) {
      toast.error("No manifesto found to delete");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete your manifesto? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Deleting manifesto...");

    try {
      await axios.delete(`${API_BASE_URL}/leaders/manifestos/${manifestoId}`);

      toast.update(toastId, {
        render: "Manifesto deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Reset form
      setManifestoId(null);
      setFormData({
        leader_id: activeLeaderId,
        main_agenda: "",
        agenda_items: [{ title: "", description: "" }],
      });

      if (onManifestoChange) {
        onManifestoChange(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete manifesto";
      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <Loader2
          className="animate-spin"
          size={40}
          color="#1e3c72"
          style={{ margin: "0 auto" }}
        />
        <p style={{ marginTop: "15px", color: "#64748b", fontWeight: "600" }}>
          Syncing your data...
        </p>
      </div>
    );

  return (
    <div style={{ background: "transparent", padding: "10px" }}>
      <ToastContainer position="top-right" theme="colored" />

      {manifestoId && (
        <ModeSwitch>
          <button
            className={mode === "edit" ? "active" : ""}
            onClick={() => setMode("edit")}
          >
            <Edit3 size={16} style={{ marginRight: "8px" }} />
            Edit Manifesto
          </button>
          <button
            className={mode === "delete" ? "active" : ""}
            onClick={() => setMode("delete")}
            style={
              mode === "delete"
                ? { background: "#ef4444", borderColor: "#ef4444" }
                : {}
            }
          >
            <Trash2 size={16} style={{ marginRight: "8px" }} />
            Delete Manifesto
          </button>
        </ModeSwitch>
      )}

      {mode === "delete" && manifestoId ? (
        <GlassCard>
          <div style={{ padding: "60px 40px", textAlign: "center" }}>
            <XCircle
              size={80}
              color="#ef4444"
              style={{ marginBottom: "20px" }}
            />
            <h2 style={{ color: "#ef4444", marginBottom: "15px" }}>
              Delete Manifesto
            </h2>
            <p style={{ color: "#64748b", marginBottom: "30px" }}>
              Are you sure you want to delete your manifesto? This will
              permanently remove all your agenda items and any votes associated
              with it.
            </p>
            <DeleteButton onClick={handleDelete} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              {loading ? "Deleting..." : "Permanently Delete Manifesto"}
            </DeleteButton>
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <FormSide>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "30px",
              }}
            >
              <FileText size={28} color="#1e3c72" />
              <h2 style={{ margin: 0, fontWeight: 900, color: "#1e293b" }}>
                {manifestoId
                  ? "Edit Campaign Agenda"
                  : "Create Campaign Agenda"}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <InputGroup>
                <label>The Vision Statement</label>
                <StyledInput
                  placeholder="e.g. A digital-first economy for all Kenyans"
                  value={formData.main_agenda}
                  onChange={(e) =>
                    setFormData({ ...formData, main_agenda: e.target.value })
                  }
                  required
                />
              </InputGroup>

              <InputGroup>
                <label>Manifesto Pillars</label>
                {formData.agenda_items.map((item, i) => (
                  <AgendaBox key={i}>
                    <StyledInput
                      placeholder="Pillar Title (e.g. Healthcare)"
                      value={item.title}
                      onChange={(e) =>
                        handleAgendaChange(i, "title", e.target.value)
                      }
                    />
                    <StyledTextArea
                      placeholder="Briefly describe your plan..."
                      value={item.description}
                      onChange={(e) =>
                        handleAgendaChange(i, "description", e.target.value)
                      }
                    />
                    {formData.agenda_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePoint(i)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "12px",
                          marginTop: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Trash2 size={14} /> Remove Pillar
                      </button>
                    )}
                  </AgendaBox>
                ))}
              </InputGroup>

              <button
                type="button"
                onClick={addPoint}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px dashed #cbd5e1",
                  background: "white",
                  color: "#64748b",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "30px",
                }}
              >
                <Plus size={18} style={{ marginRight: "8px" }} /> Add Another
                Pillar
              </button>

              <ActionButton disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Send size={18} />{" "}
                    {manifestoId
                      ? "Update My Manifesto"
                      : "Publish My Manifesto"}
                  </>
                )}
              </ActionButton>
            </form>
          </FormSide>

          <PreviewSide>
            <div
              style={{
                opacity: 0.5,
                fontSize: "10px",
                fontWeight: "900",
                letterSpacing: "2px",
                marginBottom: "30px",
              }}
            >
              LIVE PREVIEW
            </div>

            <div
              style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "20px" }}
            >
              <Sparkles
                size={20}
                color="#3b82f6"
                style={{ marginBottom: "10px" }}
              />
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  marginBottom: "10px",
                }}
              >
                The Vision
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontStyle: "italic",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                "
                {formData.main_agenda ||
                  "Your vision statement will appear here..."}
                "
              </p>
            </div>

            <div style={{ marginTop: "40px" }}>
              <h4
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "#3b82f6",
                  marginBottom: "20px",
                  fontWeight: "900",
                }}
              >
                Strategic Pillars
              </h4>
              {formData.agenda_items.map(
                (item, i) =>
                  item.title && (
                    <div
                      key={i}
                      style={{
                        marginBottom: "20px",
                        background: "rgba(255,255,255,0.05)",
                        padding: "15px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "white",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#94a3b8",
                          marginTop: "5px",
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </PreviewSide>
        </GlassCard>
      )}
    </div>
  );
};

export default CreateManifesto;
