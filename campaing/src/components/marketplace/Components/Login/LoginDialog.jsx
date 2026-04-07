import React, { useState } from "react";
import styled from "styled-components";
import { X, Mail, Lock } from "lucide-react";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #212121;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: #878787;

  &:hover {
    color: #212121;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #212121;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #878787;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2874f0;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  background: #fb641b;
  color: white;
  border: none;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background: #f85606;
  }
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #878787;

  span {
    color: #2874f0;
    cursor: pointer;
    margin-left: 8px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginDialog = ({ open, setOpen, setAccount }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      // Simple login simulation
      const userData = {
        username: formData.username,
        email: formData.email,
      };
      setAccount(userData);
      localStorage.setItem("account", JSON.stringify(userData));
    } else {
      // Simple signup simulation
      const userData = {
        username: formData.username,
        email: formData.email,
      };
      setAccount(userData);
      localStorage.setItem("account", JSON.stringify(userData));
    }

    setOpen(false);
    setFormData({ username: "", email: "", password: "" });
  };

  return (
    <Overlay onClick={() => setOpen(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>{isLogin ? "Login" : "Sign Up"}</Title>
          <CloseButton onClick={() => setOpen(false)}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <InputGroup>
                <Label>Username</Label>
                <InputWrapper>
                  <InputIcon>
                    <User size={16} />
                  </InputIcon>
                  <Input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
            )}

            <InputGroup>
              <Label>Email</Label>
              <InputWrapper>
                <InputIcon>
                  <Mail size={16} />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <InputWrapper>
                <InputIcon>
                  <Lock size={16} />
                </InputIcon>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
            </InputGroup>

            <LoginButton type="submit">
              {isLogin ? "Login" : "Sign Up"}
            </LoginButton>

            <SignupLink>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign up" : "Login"}
              </span>
            </SignupLink>
          </form>
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

export default LoginDialog;
