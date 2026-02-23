import React, { useState } from "react";
import axios from "axios"; // Imported Axios
import styled from "styled-components";
import {
  UserPlus,
  ShieldCheck,
  MapPin,
  ClipboardList,
  Calendar,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = axios.create({
  baseURL:
    "https://reports-peaceful-premises-everywhere.trycloudflare.com/api/v1",
});

const API_BASE_URL =
  "https://reports-peaceful-premises-everywhere.trycloudflare.com/api/v1";

const PageWrapper = styled.div`
  background: #f1f5f9;
  min-height: 100vh;
  padding: 40px 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Inter", sans-serif;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 550px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: #bb0000;
  padding: 30px;
  color: white;
  text-align: center;
`;

const Section = styled.div`
  padding: 30px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 8px;
  margin-top: 15px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: 0.3s;
  &:focus {
    border-color: #bb0000;
    outline: none;
    background: #fffafa;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 15px;
  cursor: pointer;
  &:focus {
    border-color: #bb0000;
    outline: none;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 18px;
  background: #bb0000;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;
  &:hover {
    background: #990000;
    transform: translateY(-1px);
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: "",
    age_bracket: "",
    county: "",
    ward: "",
    voter_card: "",
    will_vote: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Using Axios instance created above
      const response = await API.post("/users/register", formData);

      // Axios puts the response body in .data
      const data = response.data;

      if (data.success) {
        toast.success(
          `Success! Your assigned username is: ${data.assignedUsername}`,
        );

        // Redirect to login after 3 seconds so they can see their username
        setTimeout(() => {
          navigate("/login", {
            state: { autoUsername: data.assignedUsername },
          });
        }, 3500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Connection Error. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ToastContainer hideProgressBar position="top-center" theme="colored" />
      <FormCard>
        <Header>
          <h2 style={{ margin: 0, letterSpacing: "1px" }}>
            WANANCHI TECH FOUNDATION
          </h2>
          <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "14px" }}>
            Secure Citizen Registration
          </p>
        </Header>

        <form onSubmit={handleSubmit}>
          <Section>
            <Grid>
              <div>
                <Label>Gender *</Label>
                <Select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <Label>
                  <Calendar size={14} /> Age Bracket *
                </Label>
                <Select
                  name="age_bracket"
                  required
                  value={formData.age_bracket}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="18-25">18 - 25 (Gen Z)</option>
                  <option value="26-35">26 - 35 (Millennials)</option>
                  <option value="36-45">36 - 45 (Gen X)</option>
                  <option value="46-55">46 - 55 (Gen X)</option>
                  <option value="56+">56+ (Boomers)</option>
                </Select>
              </div>
            </Grid>

            <Grid>
              <div>
                <Label>
                  <MapPin size={14} /> County *
                </Label>
                <Input
                  name="county"
                  placeholder="Nairobi"
                  required
                  value={formData.county}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>
                  <MapPin size={14} /> Ward
                </Label>
                <Input
                  name="ward"
                  placeholder="Kilimani"
                  value={formData.ward}
                  onChange={handleChange}
                />
              </div>
            </Grid>

            <Grid>
              <div>
                <Label>
                  <ShieldCheck size={14} /> Voter's Card? *
                </Label>
                <Select
                  name="voter_card"
                  required
                  value={formData.voter_card}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </div>
              <div>
                <Label>
                  <ClipboardList size={14} /> Will you vote? *
                </Label>
                <Select
                  name="will_vote"
                  required
                  value={formData.will_vote}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not Sure">Not Sure</option>
                </Select>
              </div>
            </Grid>

            <Label>
              <Lock size={14} /> Create Secure Password *
            </Label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Generating ID..." : "Register & Get My ID"}
              {!loading && <UserPlus size={20} />}
            </SubmitBtn>

            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "20px",
              }}
            >
              Your unique Username will be assigned by the system after you
              click register.
            </p>
          </Section>
        </form>
      </FormCard>
    </PageWrapper>
  );
};

export default RegistrationPage;
